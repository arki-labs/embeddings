/**
 * `@arki/embeddings/rerank`: put search hits in order of relevance to one query. A reranker reads
 * the query and each document together (a cross-encoder), so it is slower than comparing vectors
 * and much better at the top of a list. The rerankers live in their provider's subpath
 * (`createCohereReranker` in `./cohere`, `createTransformersReranker` in `./transformers`, …);
 * this entry holds the shape they share, `rerank()` and the cache. No provider code, no peer.
 */
import { z } from 'zod';
import { invariant, isFailure } from '@arki/failure';
import { getLogger } from '@arki/log';
import { assert } from '@arki/schema';
import { Cancelled, InputTooLong, InvalidOutput } from '../failures.js';
import { functionSchema, objectSchema, withOptionsJson } from '../schemas.js';
import { sha256Hex } from '../sha256.js';
import { addTokens, CHARS_PER_TOKEN } from '../tokens.js';
/** Every provider a reranker in this package talks to. `cohere-compatible` = Infinity, vLLM, llama.cpp. */
export const RERANK_PROVIDERS = [
    'cohere',
    'cohere-compatible',
    'voyage',
    'jina',
    'tei',
    'transformers',
    'fake',
];
/** `RerankCallOptions`, a type test locks it to the type. */
export const rerankCallOptionsSchema = withOptionsJson(z.object({ truncate: z.boolean().optional(), signal: objectSchema().optional() }).readonly());
/**
 * `RerankOptions`, checked by `rerank`; a type test locks it to the type at `Item = unknown` (a
 * function field is checked as a function, so the item type is not part of the schema).
 */
export const rerankOptionsSchema = withOptionsJson(z
    .object({
    text: functionSchema(),
    topK: z.number().int().nonnegative().optional(),
    onTooLong: z.enum(['fail', 'truncate', 'split']).optional(),
    signal: objectSchema().optional(),
})
    .readonly());
const NO_USAGE = { tokens: { basis: 'counted', count: 0 }, requests: 0, cacheHits: 0 };
function addUsage(a, b) {
    return {
        tokens: addTokens(a.tokens, b.tokens),
        requests: a.requests + b.requests,
        cacheHits: a.cacheHits + b.cacheHits,
        ...(a.loadMs === undefined && b.loadMs === undefined ? {} : { loadMs: (a.loadMs ?? 0) + (b.loadMs ?? 0) }),
    };
}
function tokensOf(reranker, text) {
    return reranker.countTokens === undefined
        ? { basis: 'estimated', count: Math.ceil(text.length / CHARS_PER_TOKEN) }
        : { basis: 'counted', count: reranker.countTokens(text) };
}
/** `text.slice(start, end)` moved so neither edge falls between the two halves of a surrogate pair. */
function sliceWhole(text, start, end) {
    const high = (at) => at > 0 && at < text.length && /[\uD800-\uDBFF]/.test(text.charAt(at - 1));
    return { from: high(start) ? start + 1 : start, to: high(end) ? end - 1 : end };
}
/**
 * Without a tokenizer a window is sized at 2 characters per token, not 4: Romanian runs near 3 and
 * the 4 of the length check would overflow most windows. A denser script (CJK) can still overflow;
 * the reranker then refuses it (`InputTooLong`), so no text is lost silently.
 */
const SPLIT_CHARS_PER_TOKEN = CHARS_PER_TOKEN / 2;
/**
 * Windows of `text` that each fit in `room` tokens, overlapping by a quarter, so a sentence cut at
 * one window's edge is whole in the next. Sized by the tokenizer when the reranker has one.
 */
function windowsOf(reranker, text, room) {
    let size = room * (reranker.countTokens === undefined ? SPLIT_CHARS_PER_TOKEN : CHARS_PER_TOKEN);
    if (reranker.countTokens !== undefined) {
        // Shrink until a window from the start fits; dense scripts spend more than one token per character.
        for (let tries = 0; tries < 8; tries++) {
            const counted = reranker.countTokens(text.slice(0, size));
            if (counted <= room)
                break;
            // At least 2, so a window can always hold one whole surrogate pair.
            size = Math.max(2, Math.floor(((size * room) / counted) * 0.95));
        }
    }
    const stride = Math.max(1, Math.floor((size * 3) / 4));
    const windows = [];
    for (let start = 0; start < text.length; start += stride) {
        const { from, to } = sliceWhole(text, start, Math.min(text.length, start + size));
        // Both edges moved inward on one pair: nothing left to score here, the next window holds it.
        if (from < to)
            windows.push(text.slice(from, to));
        if (start + size >= text.length)
            break;
    }
    return windows;
}
/**
 * Orders `items` by relevance to `query`. Splits them over `maxDocuments` requests and merges the
 * scores, then keeps `topK`, so a per-request cut never drops a global winner. Each hit carries
 * the item itself and its index in `items`; ties keep input order. All or nothing: the first
 * failure is returned and no partial ranking is.
 *
 * @example
 * const ranked = await rerank(reranker, 'cum se calculează TVA?', hits, { text: hit => hit.text, topK: 10 });
 * if (isFailure(ranked)) return ranked;
 * ranked.hits[0]?.item; // the most relevant hit
 */
export async function rerank(reranker, query, items, options) {
    assert(options, rerankOptionsSchema, { at: 'rerank options' });
    const { text, topK, onTooLong = 'fail', signal } = options;
    // A custom reranker with 0 or NaN here would never advance through the requests.
    invariant(Number.isInteger(reranker.maxDocuments) && reranker.maxDocuments >= 1, () => `${reranker.id} maxDocuments must be a whole number ≥ 1, got ${reranker.maxDocuments}`);
    if (signal?.aborted)
        return Cancelled();
    if (items.length === 0)
        return { hits: [], usage: NO_USAGE };
    const queryTokens = tokensOf(reranker, query);
    // What is left for one document beside the query.
    const room = reranker.maxInputTokens - queryTokens.count;
    if (room <= 0)
        return InputTooLong({ index: -1, tokens: queryTokens, max: reranker.maxInputTokens });
    const windows = [];
    for (const [index, item] of items.entries()) {
        const document = text(item);
        const tokens = tokensOf(reranker, document);
        if (tokens.count <= room || onTooLong === 'truncate') {
            windows.push({ item: index, text: document });
            continue;
        }
        if (onTooLong === 'fail') {
            return InputTooLong({
                index,
                tokens: { basis: tokens.basis, count: tokens.count + queryTokens.count },
                max: reranker.maxInputTokens,
            });
        }
        for (const window of windowsOf(reranker, document, room))
            windows.push({ item: index, text: window });
    }
    // Best score per item: a split item is as relevant as its most relevant window.
    const scores = new Float64Array(items.length).fill(Number.NEGATIVE_INFINITY);
    let usage;
    for (let start = 0; start < windows.length; start += reranker.maxDocuments) {
        if (signal?.aborted)
            return Cancelled();
        const chunk = windows.slice(start, start + reranker.maxDocuments);
        const result = await reranker.rerank(query, chunk.map(window => window.text), 
        // A split window that the estimate let through over the limit fails instead of losing its end.
        { ...(onTooLong === 'truncate' ? { truncate: true } : {}), ...(signal === undefined ? {} : { signal }) });
        if (isFailure(result)) {
            // An index from the reranker counts within the chunk; the caller's counts within `items`.
            if (InputTooLong.is(result)) {
                const window = chunk[result.data.index];
                return InputTooLong({ ...result.data, index: window === undefined ? -1 : window.item });
            }
            return result;
        }
        // A custom or wrapped reranker could answer the wrong set; a hole would rank an item it never scored.
        const seen = new Set();
        for (const hit of result.hits) {
            const window = chunk[hit.index];
            if (window === undefined || seen.has(hit.index) || !Number.isFinite(hit.score)) {
                return InvalidOutput({ reason: `reranker answered a bad hit: index ${hit.index}, score ${hit.score}` });
            }
            seen.add(hit.index);
            scores[window.item] = Math.max(scores[window.item] ?? Number.NEGATIVE_INFINITY, hit.score);
        }
        if (seen.size !== chunk.length) {
            return InvalidOutput({ reason: `reranker scored ${seen.size} of ${chunk.length} documents` });
        }
        usage = usage === undefined ? result.usage : addUsage(usage, result.usage);
    }
    const ranked = items
        .map((item, index) => ({ item, index, score: scores[index] ?? Number.NEGATIVE_INFINITY }))
        .sort((left, right) => right.score - left.score || left.index - right.index);
    return { hits: topK === undefined ? ranked : ranked.slice(0, topK), usage: usage ?? NO_USAGE };
}
/** `RerankCacheOptions`, checked by `withRerankCache`; a type test locks it to the type. */
export const rerankCacheOptionsSchema = withOptionsJson(z.object({ namespace: z.string().optional(), ttlMs: z.number().positive().optional() }).readonly());
const log = getLogger('arki:embeddings');
const encoder = new TextEncoder();
/** One score per key: 8 bytes, little-endian float64, the same on every machine sharing a store. */
function encodeScore(score) {
    const bytes = new Uint8Array(8);
    new DataView(bytes.buffer).setFloat64(0, score, true);
    return bytes;
}
function decodeScore(bytes) {
    if (bytes?.length !== 8)
        return undefined;
    const score = new DataView(bytes.buffer, bytes.byteOffset, 8).getFloat64(0, true);
    return Number.isFinite(score) ? score : undefined;
}
/**
 * The same reranker with a score cache in front. A key covers the provider, model, revision,
 * truncation choice, namespace, query and document, so a model change misses instead of answering
 * an old score. Cached documents are filled from `store`; the rest go to the reranker as one call.
 * A store that throws is a miss (reads) or skipped (writes), logged at `warn`; an entry that is not
 * a score is a miss.
 *
 * @example
 * const cached = withRerankCache(reranker, memoryCacheStore({ maxEntries: 100_000 }));
 */
export function withRerankCache(reranker, store, options = {}) {
    // Returns a `Reranker`, never a failure, so a bad option is a bug in the caller and throws.
    assert(options, rerankCacheOptionsSchema, { at: 'withRerankCache options' });
    const { namespace = '', ttlMs } = options;
    const keyOf = (query, document, truncate) => sha256Hex(encoder.encode(JSON.stringify([
        'rerank/1',
        reranker.provider,
        reranker.id,
        reranker.revision ?? '',
        truncate,
        namespace,
        query,
        document,
    ])));
    const read = async (key) => {
        try {
            return decodeScore(await store.get(key));
        }
        catch (error) {
            log.warn('rerank cache read failed; treated as a miss: {error}', { error: String(error) });
            return;
        }
    };
    const write = async (key, score) => {
        try {
            await store.set(key, encodeScore(score), ttlMs);
        }
        catch (error) {
            log.warn('rerank cache write failed; the score is returned uncached: {error}', { error: String(error) });
        }
    };
    const cachedRerank = async (query, documents, callOptions) => {
        const keys = documents.map(document => keyOf(query, document, callOptions.truncate === true));
        const found = await Promise.all(keys.map(key => read(key)));
        const missing = documents.flatMap((document, index) => (found[index] === undefined ? [{ document, index }] : []));
        const hits = found.flatMap((score, index) => (score === undefined ? [] : [{ index, score }]));
        if (missing.length === 0) {
            // Nothing was sent, so exactly zero tokens were spent.
            return { hits: hits.sort((a, b) => b.score - a.score), usage: { ...NO_USAGE, cacheHits: hits.length } };
        }
        const result = await reranker.rerank(query, missing.map(entry => entry.document), callOptions);
        if (isFailure(result)) {
            if (!InputTooLong.is(result))
                return result;
            return InputTooLong({ ...result.data, index: missing[result.data.index]?.index ?? -1 });
        }
        const writes = [];
        for (const hit of result.hits) {
            const entry = missing[hit.index];
            const key = entry === undefined ? undefined : keys[entry.index];
            // Never cache a score that belongs to no document.
            if (entry === undefined || key === undefined || !Number.isFinite(hit.score)) {
                return InvalidOutput({ reason: `reranker answered a bad hit: index ${hit.index}, score ${hit.score}` });
            }
            hits.push({ index: entry.index, score: hit.score });
            writes.push(write(key, hit.score));
        }
        await Promise.all(writes);
        return {
            hits: hits.sort((a, b) => b.score - a.score),
            usage: { ...result.usage, cacheHits: result.usage.cacheHits + documents.length - missing.length },
        };
    };
    return { ...reranker, rerank: cachedRerank };
}
//# sourceMappingURL=index.js.map