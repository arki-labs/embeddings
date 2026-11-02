/**
 * `@arki/embeddings/ollama`: a local Ollama server over `fetch` (`/api/embed`, one request per chunk).
 * No SDK and no peer, so it runs on every runtime that has `fetch`.
 */
import { z } from 'zod';
import { isFailure } from '@arki/failure';
import { is, recordSchema } from '@arki/schema';
import { Cancelled, ConfigurationFailure, InputTooLong, InvalidOutput, ModelUnavailable, RateLimited } from '../failures.js';
import { functionSchema, instructionSchema, parseOptions, withOptionsJson } from '../schemas.js';
import { retryAfterMs, requestSignal } from '../http.js';
import { EMBEDDINGGEMMA_INSTRUCTION, NO_INSTRUCTION, NOMIC_INSTRUCTION, QWEN3_INSTRUCTION } from '../instructions.js';
import { countTokens } from '../tokens.js';
// Ollama words a 400 for an over-long input two ways: "input exceeds maximum context length" (recorded in
// __fixtures__/embed-too-long.json) and "the input length exceeds the context length" (newer servers, from memory).
const TOO_LONG = /input (?:length )?exceeds (?:the |maximum )?context length/i;
/** `InputTooLong` naming the input with the most tokens by `countTokens`: the likeliest culprit, with that count. */
function inputTooLong(model, texts) {
    let index = 0;
    let tokens = { basis: 'unknown' };
    for (const [position, text] of texts.entries()) {
        const counted = countTokens(model, text);
        if (counted.basis === 'unknown' || (tokens.basis !== 'unknown' && counted.count <= tokens.count))
            continue;
        index = position;
        tokens = counted;
    }
    return InputTooLong({ index, tokens, max: model.maxInputTokens });
}
/** `OllamaModelOptions`, checked by `createOllamaModel`; a type test locks it to the type. */
export const ollamaModelOptionsSchema = withOptionsJson(z
    .object({
    id: z.string().min(1).optional(),
    baseURL: z.url({ protocol: /^https?$/ }).optional(),
    keepAlive: z.union([z.string().min(1), z.number()]).optional(),
    dimensions: z.number().int().positive().optional(),
    instruction: instructionSchema.optional(),
    fetch: functionSchema().optional(),
})
    .readonly());
/** What we know about the embedding models Ollama ships. Anything else needs `dimensions` from the caller. */
const OLLAMA_FACTS = {
    'qwen3-embedding:0.6b': {
        dimensions: 1024,
        matryoshka: [1024, 768, 512, 256],
        maxInputTokens: 32_768,
        maxBatch: 64,
        maxBatchTokens: 65_536,
        normalized: true,
        instruction: QWEN3_INSTRUCTION,
    },
    // The GPU tier: the card allows any size from 32 to 2560; these are the useful steps.
    'qwen3-embedding:4b': {
        dimensions: 2560,
        matryoshka: [2560, 2048, 1536, 1024, 768, 512, 256],
        maxInputTokens: 32_768,
        maxBatch: 64,
        maxBatchTokens: 65_536,
        normalized: true,
        instruction: QWEN3_INSTRUCTION,
    },
    embeddinggemma: {
        dimensions: 768,
        matryoshka: [768, 512, 256, 128],
        maxInputTokens: 2048,
        maxBatch: 64,
        maxBatchTokens: 65_536,
        normalized: true,
        instruction: EMBEDDINGGEMMA_INSTRUCTION,
    },
    'nomic-embed-text': {
        dimensions: 768,
        matryoshka: [],
        maxInputTokens: 8192,
        maxBatch: 64,
        maxBatchTokens: 65_536,
        normalized: true,
        instruction: NOMIC_INSTRUCTION,
    },
};
/** Conservative limits for a model id we have no facts for. */
const UNKNOWN_MODEL_LIMITS = { maxInputTokens: 2048, maxBatch: 64, maxBatchTokens: 65_536 };
/** `nomic-embed-text` and `nomic-embed-text:latest` are the same model. */
const withTag = (id) => (id.includes(':') ? id : `${id}:latest`);
/**
 * An Ollama model record. `revision` is the model digest, read once from `/api/tags` on the
 * first call (resolving a model must never touch the network), so it is `undefined` until then.
 *
 * @example
 * const model = createOllamaModel({ id: 'qwen3-embedding:0.6b', baseURL: 'http://127.0.0.1:11434' });
 */
export function createOllamaModel(input = {}) {
    const options = parseOptions(ollamaModelOptionsSchema, input, 'ollama');
    if (isFailure(options))
        return options;
    const id = options.id ?? 'qwen3-embedding:0.6b';
    const baseURL = (options.baseURL ?? 'http://127.0.0.1:11434').replace(/\/+$/, '');
    const send = options.fetch ?? ((url, init) => fetch(url, init));
    const known = OLLAMA_FACTS[id] ?? OLLAMA_FACTS[id.replace(/:latest$/, '')];
    if (known === undefined && options.dimensions === undefined) {
        return ConfigurationFailure({
            message: `ollama model ${id} is not in the facts table; pass its native dimensions`,
        });
    }
    if (known !== undefined &&
        options.dimensions !== undefined &&
        options.dimensions !== known.dimensions &&
        !known.matryoshka.includes(options.dimensions)) {
        return ConfigurationFailure({
            message: `ollama model ${id} makes ${known.dimensions} dimensions (or ${known.matryoshka.join(', ') || 'no smaller size'}), not ${options.dimensions}`,
        });
    }
    const facts = known === undefined
        ? {
            ...UNKNOWN_MODEL_LIMITS,
            dimensions: options.dimensions ?? 0,
            matryoshka: [],
            normalized: true,
            instruction: NO_INSTRUCTION,
        }
        : { ...known, dimensions: options.dimensions ?? known.dimensions };
    // A known model asked for a smaller Matryoshka size gets that size on every request.
    const recordSize = known !== undefined && facts.dimensions !== known.dimensions ? facts.dimensions : undefined;
    let digest;
    let digestRequest;
    /** Why the last read found no digest, for `loadRevision`. */
    let digestMiss = 'unreachable';
    /** Reads the digest once. A failed read leaves it unknown and is retried on the next call. */
    const learnDigest = (signal) => {
        digestRequest ??= (async () => {
            digestMiss = 'unreachable';
            try {
                const response = await send(`${baseURL}/api/tags`, { method: 'GET', signal: requestSignal(signal) });
                const body = response.ok ? await response.json() : undefined;
                // The server answered its model list, so a missing entry means the model is not pulled.
                if (response.ok)
                    digestMiss = 'not-pulled';
                const models = is(body, recordSchema) && Array.isArray(body['models']) ? body['models'] : [];
                const entry = models.find((model) => is(model, recordSchema) && (model['name'] === withTag(id) || model['model'] === withTag(id)));
                const value = is(entry, recordSchema) ? entry['digest'] : undefined;
                if (typeof value === 'string')
                    digest = value;
            }
            catch {
                // Unreachable or aborted: the embed request that follows reports it as a failure value.
            }
            if (digest === undefined)
                digestRequest = undefined;
        })();
        return digestRequest;
    };
    const embedTexts = async ({ texts, dimensions = recordSize, truncate, signal }) => {
        if (digest === undefined)
            await learnDigest(signal);
        let response;
        try {
            response = await send(`${baseURL}/api/embed`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    model: id,
                    input: texts,
                    // Ollama cuts an over-long input itself only when asked; otherwise it answers 400.
                    truncate: truncate === true,
                    ...(options.keepAlive === undefined ? {} : { keep_alive: options.keepAlive }),
                    ...(dimensions === undefined ? {} : { dimensions }),
                }),
                signal: requestSignal(signal),
            });
        }
        catch {
            return signal?.aborted ? Cancelled() : ModelUnavailable({ model: id, reason: 'unreachable' });
        }
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            if (response.status === 404)
                return ModelUnavailable({ model: id, reason: 'not-pulled' });
            if (response.status === 401 || response.status === 403) {
                return ConfigurationFailure({ message: `ollama refused the credentials (${response.status}); check the proxy in front of it` });
            }
            if (response.status === 429) {
                const wait = retryAfterMs(name => response.headers.get(name));
                return RateLimited(wait === undefined ? {} : { retryAfterMs: wait });
            }
            if (response.status === 400 && TOO_LONG.test(text)) {
                return inputTooLong(model, texts);
            }
            // A server fault is worth another try: it is the same unreachable failure a dropped connection is.
            if (response.status >= 500)
                return ModelUnavailable({ model: id, reason: 'unreachable' });
            return InvalidOutput({ reason: `ollama answered ${response.status}: ${text.slice(0, 200)}` });
        }
        let body;
        try {
            body = await response.json();
        }
        catch {
            return signal?.aborted ? Cancelled() : InvalidOutput({ reason: 'ollama answered malformed JSON' });
        }
        const embeddings = is(body, recordSchema) ? body['embeddings'] : undefined;
        if (!Array.isArray(embeddings) || !embeddings.every(item => Array.isArray(item))) {
            return InvalidOutput({ reason: 'ollama answered without an embeddings array' });
        }
        const promptTokens = is(body, recordSchema) ? body['prompt_eval_count'] : undefined;
        const loadNs = is(body, recordSchema) ? body['load_duration'] : undefined;
        return {
            vectors: embeddings,
            tokens: typeof promptTokens === 'number'
                ? { basis: 'reported', count: promptTokens }
                : { basis: 'unknown' },
            ...(typeof loadNs === 'number' ? { loadMs: loadNs / 1e6 } : {}),
        };
    };
    const model = {
        provider: 'ollama',
        id,
        get revision() {
            return digest;
        },
        async loadRevision(signal) {
            if (digest === undefined)
                await learnDigest(signal);
            return digest === undefined ? ModelUnavailable({ model: id, reason: digestMiss }) : undefined;
        },
        assurance: 'operator-pinned',
        local: true,
        ...facts,
        ...(options.instruction === undefined ? {} : { instruction: options.instruction }),
        inputs: ['text'],
        quantizations: [],
        embedTexts,
    };
    return model;
}
//# sourceMappingURL=index.js.map