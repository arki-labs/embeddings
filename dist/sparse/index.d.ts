import type { EmbedFailure } from '../failures.js';
import type { FetchLike } from '../http.js';
import type { EmbeddingsLogger, EmbeddingSpace, Usage } from '../types.js';
import { ConfigurationFailure, SpaceMismatch } from '../failures.js';
/**
 * The space of a sparse vector: `dimensions` is the vocabulary size and `vocabulary` names the
 * tokenizer its indices point into. Held once per batch and per index, not on every vector.
 */
export type SparseSpace = EmbeddingSpace & {
    /** The tokenizer vocabulary, e.g. `'naver/splade-v3'`. Index 2054 is a different token in another vocabulary. */
    readonly vocabulary: string;
};
/** Token weights: `indices` ascending and unique, `values[i]` the weight of token `indices[i]`. */
export type SparseVector = {
    readonly indices: Uint32Array;
    readonly values: Float32Array;
};
export type SparseBatch = {
    readonly vectors: readonly SparseVector[];
    readonly space: SparseSpace;
    readonly usage: Usage;
};
export type SparseEmbedOptions = {
    /** An input longer than the server accepts: `'fail'` (default) returns `InputTooLong`; `'truncate'` lets TEI cut it. */
    readonly onTooLong?: 'fail' | 'truncate';
    readonly signal?: AbortSignal;
};
/** `SparseEmbedOptions`, checked by the embedder's `embed`; a type test locks it to the type. */
export declare const sparseEmbedOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    onTooLong?: "fail" | "truncate" | undefined;
    signal?: AbortSignal | undefined;
}>, Readonly<{
    onTooLong?: "fail" | "truncate" | undefined;
    signal?: AbortSignal | undefined;
}>>;
/** A sparse model with its server fixed. `embed` is one request of at most `maxBatch` texts, no retry. */
export type SparseEmbedder = {
    readonly id: string;
    readonly space: SparseSpace;
    readonly maxBatch: number;
    readonly maxInputTokens: number;
    embed(texts: readonly string[], options: SparseEmbedOptions): Promise<SparseBatch | EmbedFailure>;
};
export type SparseModelOptions = {
    /** The model TEI serves, e.g. `'naver/splade-v3'`. */
    readonly id: string;
    /** The TEI server root, e.g. `'http://127.0.0.1:8080'`. */
    readonly baseURL: string;
    /** Sent as `Authorization: Bearer <apiKey>`. Local servers need none. */
    readonly apiKey?: string;
    /** HF commit the server runs; part of the space. */
    readonly revision?: string;
    /** Vocabulary size: 30522 for BERT-based SPLADE. Every index must be below it. */
    readonly dimensions: number;
    /** Default: `id`. Set it when the tokenizer is not the model's own. */
    readonly vocabulary?: string;
    /** TEI `--max-client-batch-size`. Default 32. */
    readonly maxBatch?: number;
    /** TEI `max_input_length`. Default 512. */
    readonly maxInputTokens?: number;
    readonly fetch?: FetchLike;
    readonly log?: EmbeddingsLogger;
};
/** `SparseModelOptions`, checked by `createSparseModel`; a type test locks it to the type. */
export declare const sparseModelOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    id: string;
    baseURL: string;
    apiKey?: string | undefined;
    revision?: string | undefined;
    dimensions: number;
    vocabulary?: string | undefined;
    maxBatch?: number | undefined;
    maxInputTokens?: number | undefined;
    fetch?: FetchLike | undefined;
    log?: import("@arki/log").Logger | undefined;
}>, Readonly<{
    id: string;
    baseURL: string;
    apiKey?: string | undefined;
    revision?: string | undefined;
    dimensions: number;
    vocabulary?: string | undefined;
    maxBatch?: number | undefined;
    maxInputTokens?: number | undefined;
    fetch?: FetchLike | undefined;
    log?: import("@arki/log").Logger | undefined;
}>>;
/** The space as one readable string: the dense {@link spaceId} plus `/v:<vocabulary>`. */
export declare function sparseSpaceId(space: SparseSpace): string;
/** True when sparse vectors from `a` and `b` are comparable: same space and same vocabulary. */
export declare function isSameSparseSpace(a: SparseSpace, b: SparseSpace): boolean;
/**
 * `SpaceMismatch` when `actual` is not the space an index was built in, else `undefined`.
 *
 * @example
 * const mismatch = requireSparseSpace(storedSpace, sparse.space);
 * if (mismatch) return mismatch;
 */
export declare function requireSparseSpace(expected: SparseSpace, actual: SparseSpace): SpaceMismatch | undefined;
/**
 * A sparse embedder over TEI's `/embed_sparse`. The operator decides what the server runs, so
 * state `dimensions` (the vocabulary size) and, to pin it, `revision`.
 *
 * @example
 * // Apache-2.0, multilingual; TEI: --model-id opensearch-project/opensearch-neural-sparse-encoding-multilingual-v1 --pooling splade
 * const splade = createSparseModel({
 *   id: 'opensearch-project/opensearch-neural-sparse-encoding-multilingual-v1',
 *   baseURL: 'http://127.0.0.1:8080',
 *   dimensions: 105_879,
 * });
 * if (isFailure(splade)) throw new Error(splade.message);
 * const batch = await splade.embed(['what is a sparse vector?'], {});
 */
export declare function createSparseModel(input: SparseModelOptions): SparseEmbedder | ConfigurationFailure;
//# sourceMappingURL=index.d.ts.map