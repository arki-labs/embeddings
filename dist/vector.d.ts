import type { EmbeddingModel } from './types.js';
/**
 * Euclidean length.
 *
 * @example
 * norm([3, 4]); // 5
 */
export declare function norm(vector: Iterable<number>): number;
/**
 * Cosine similarity, for tests and rescoring, not search. Two zero vectors answer 0. Vectors of
 * different lengths come from different spaces and score nothing, so that is a caller bug and throws.
 *
 * @example
 * cosine(Float32Array.of(1, 0), Float32Array.of(0, 1)); // 0
 */
export declare function cosine(a: Float32Array, b: Float32Array): number;
/**
 * A unit-length copy. A zero vector is returned as a zero copy.
 *
 * @example
 * l2Normalize(Float32Array.of(3, 4)); // Float32Array [0.6, 0.8]
 */
export declare function l2Normalize(vector: Float32Array): Float32Array;
/**
 * The first `dimensions` values of a Matryoshka vector, re-normalised when the model's vectors are
 * unit length. A size the model was not trained to cut to (not its native size, not in
 * `model.matryoshka`) is `UnsupportedInput { part: 'dimensions' }`: a plain prefix of any other
 * model loses most of its meaning.
 *
 * @example
 * const short = truncate(batch.vectors[0], 256, embedder.model); // Float32Array of 256, or UnsupportedInput
 */
export declare function truncate(vector: Float32Array, dimensions: number, model: EmbeddingModel): import("@arki/failure").Failure<"embeddings.unsupported_input", {
    index: number;
    part: "batch" | "dimensions" | "image" | "quantization" | "text";
}> | Float32Array<ArrayBufferLike>;
//# sourceMappingURL=vector.d.ts.map