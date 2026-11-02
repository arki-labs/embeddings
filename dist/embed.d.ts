import type { EmbedFailure } from './failures.js';
import type { EmbedInput, EmbedOptions, Embedder, Embedding, EmbeddingBatch, Usage } from './types.js';
/**
 * `EmbedOptions`, checked by `embed`; a type test locks it to the type. Defined here, not in
 * `schemas.ts`: the root entry exports it, and `schemas.ts` holds Zod types the public `.d.ts` must not reach.
 */
export declare const embedOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    purpose?: "classification" | "clustering" | "document" | "query" | "similarity" | undefined;
    dimensions?: number | undefined;
    quantization?: "binary" | "int8" | undefined;
    onTooLong?: "fail" | "truncate" | undefined;
    signal?: AbortSignal | undefined;
}>, Readonly<{
    purpose?: "classification" | "clustering" | "document" | "query" | "similarity" | undefined;
    dimensions?: number | undefined;
    quantization?: "binary" | "int8" | undefined;
    onTooLong?: "fail" | "truncate" | undefined;
    signal?: AbortSignal | undefined;
}>>;
/** `embedMany` options: the per-call options plus how many chunks run at once and a progress callback. */
export type EmbedManyOptions = EmbedOptions & {
    readonly concurrency?: number;
    readonly onProgress?: (done: number, total: number, usage: Usage) => void;
};
/** `EmbedManyOptions`, checked by `embedMany`; a type test locks it to the type. */
export declare const embedManyOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    purpose?: "classification" | "clustering" | "document" | "query" | "similarity" | undefined;
    dimensions?: number | undefined;
    quantization?: "binary" | "int8" | undefined;
    onTooLong?: "fail" | "truncate" | undefined;
    signal?: AbortSignal | undefined;
    concurrency?: number | undefined;
    onProgress?: ((done: number, total: number, usage: Usage) => void) | undefined;
}>, Readonly<{
    purpose?: "classification" | "clustering" | "document" | "query" | "similarity" | undefined;
    dimensions?: number | undefined;
    quantization?: "binary" | "int8" | undefined;
    onTooLong?: "fail" | "truncate" | undefined;
    signal?: AbortSignal | undefined;
    concurrency?: number | undefined;
    onProgress?: ((done: number, total: number, usage: Usage) => void) | undefined;
}>>;
/**
 * Embeds any number of inputs: packs them by `maxBatch` and `maxBatchTokens`, runs the chunks with
 * bounded concurrency and reassembles vectors in input order. All or nothing: the first failure
 * cancels the remaining chunks, waits for the ones in flight, and is returned with no vectors.
 *
 * @example
 * const batch = await embedMany(embedder, texts, { purpose: 'document', concurrency: 4 });
 * if (isFailure(batch)) return batch;
 */
export declare function embedMany(embedder: Embedder, inputs: readonly EmbedInput[], options?: EmbedManyOptions): Promise<EmbeddingBatch | EmbedFailure>;
/** `embedMany` after its options check, for callers that already checked theirs (`embed`, `embedStream`). */
export declare function embedChunks(embedder: Embedder, inputs: readonly EmbedInput[], options: EmbedManyOptions): Promise<EmbeddingBatch | EmbedFailure>;
/**
 * Embeds one input. Same validation and failures as `embedMany`.
 *
 * @example
 * const query = await embed(embedder, 'refund policy', { purpose: 'query' });
 */
export declare function embed(embedder: Embedder, input: EmbedInput, options?: EmbedOptions): Promise<Embedding | EmbedFailure>;
//# sourceMappingURL=embed.d.ts.map