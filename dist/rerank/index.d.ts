import type { EmbedFailure } from '../failures.js';
import type { CacheStore, TokenCount, Usage } from '../types.js';
/** Every provider a reranker in this package talks to. `cohere-compatible` = Infinity, vLLM, llama.cpp. */
export declare const RERANK_PROVIDERS: readonly ['cohere', 'cohere-compatible', 'voyage', 'jina', 'tei', 'transformers', 'fake'];
export type RerankProviderName = (typeof RERANK_PROVIDERS)[number];
/** One scored document: `index` into the documents sent, `score` higher = more relevant. */
export type RerankHit = {
    readonly index: number;
    readonly score: number;
};
/** What one reranker call answers: every document scored once, sorted by score, highest first. */
export type RerankResult = {
    readonly hits: readonly RerankHit[];
    readonly usage: Usage;
};
/** Options of one native reranker call. */
export type RerankCallOptions = {
    /** `true`: the provider cuts a document over the limit. Otherwise an over-long one is `InputTooLong`. */
    readonly truncate?: boolean;
    readonly signal?: AbortSignal;
};
/** `RerankCallOptions`, a type test locks it to the type. */
export declare const rerankCallOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    truncate?: boolean | undefined;
    signal?: AbortSignal | undefined;
}>, Readonly<{
    truncate?: boolean | undefined;
    signal?: AbortSignal | undefined;
}>>;
/**
 * A reranking model with its server fixed. `rerank` is one request of at most `maxDocuments`
 * documents, as given: no length check, no split, no retry. Call it through {@link rerank}.
 * Scores are pointwise (each pair is scored alone), so scores from two calls compare.
 */
export type Reranker = {
    readonly provider: RerankProviderName;
    readonly id: string;
    /** The weights' commit, when the reranker knows it. Part of the cache key. */
    readonly revision?: string;
    readonly local: boolean;
    /** Most documents one `rerank` call takes. */
    readonly maxDocuments: number;
    /** Tokens of query plus one document the model reads, after its own prompt and special tokens. */
    readonly maxInputTokens: number;
    /** Exact tokens of a text, when the reranker holds its tokenizer. Otherwise `rerank()` estimates. */
    readonly countTokens?: (text: string) => number;
    rerank(query: string, documents: readonly string[], options: RerankCallOptions): Promise<RerankResult | EmbedFailure>;
    /** Frees a model loaded in process. */
    readonly dispose?: () => Promise<void>;
};
export type RerankOptions<Item> = {
    /** The text the reranker reads for an item. */
    readonly text: (item: Item) => string;
    /** Keep the best `topK` after every score is in. Default: all. */
    readonly topK?: number;
    /**
     * A document that does not fit beside the query:
     * - `'fail'` (default): `InputTooLong` naming the item, before any request.
     * - `'truncate'`: the provider cuts its end off.
     * - `'split'`: scored as overlapping windows that each fit; the item gets its best window's score.
     */
    readonly onTooLong?: 'fail' | 'truncate' | 'split';
    readonly signal?: AbortSignal;
};
/**
 * `RerankOptions`, checked by `rerank`; a type test locks it to the type at `Item = unknown` (a
 * function field is checked as a function, so the item type is not part of the schema).
 */
export declare const rerankOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    text: (item: unknown) => string;
    topK?: number | undefined;
    onTooLong?: "fail" | "split" | "truncate" | undefined;
    signal?: AbortSignal | undefined;
}>, Readonly<{
    text: (item: unknown) => string;
    topK?: number | undefined;
    onTooLong?: "fail" | "split" | "truncate" | undefined;
    signal?: AbortSignal | undefined;
}>>;
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
export declare function rerank<Item>(reranker: Reranker, query: string, items: readonly Item[], options: RerankOptions<Item>): Promise<import("@arki/failure").Failure<"embeddings.cancelled", undefined> | import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}> | import("@arki/failure").Failure<"embeddings.input_too_long", {
    index: number;
    tokens: TokenCount;
    max: number;
}> | import("@arki/failure").Failure<"embeddings.invalid_output", {
    reason: string;
}> | import("@arki/failure").Failure<"embeddings.model_unavailable", {
    model: string;
    reason: "not-pulled" | "peer-missing" | "unknown-model" | "unreachable";
}> | import("@arki/failure").Failure<"embeddings.rate_limited", {
    retryAfterMs?: number | undefined;
}> | import("@arki/failure").Failure<"embeddings.space_mismatch", {
    expected: import("../types.js").EmbeddingSpace;
    actual: import("../types.js").EmbeddingSpace;
}> | import("@arki/failure").Failure<"embeddings.unsupported_input", {
    index: number;
    part: "batch" | "dimensions" | "image" | "quantization" | "text";
}> | import("@arki/failure").Failure<"failure.unexpected_defect", undefined> | {
    hits: {
        item: Item;
        index: number;
        score: number;
    }[];
    usage: Usage;
}>;
export type RerankCacheOptions = {
    /** Mixed into every key, so two caches can share one store without sharing entries. */
    readonly namespace?: string;
    /** Passed to `store.set`; absent = the store's own default. */
    readonly ttlMs?: number;
};
/** `RerankCacheOptions`, checked by `withRerankCache`; a type test locks it to the type. */
export declare const rerankCacheOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    namespace?: string | undefined;
    ttlMs?: number | undefined;
}>, Readonly<{
    namespace?: string | undefined;
    ttlMs?: number | undefined;
}>>;
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
export declare function withRerankCache(reranker: Reranker, store: CacheStore, options?: RerankCacheOptions): Reranker;
//# sourceMappingURL=index.d.ts.map