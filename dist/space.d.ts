import type { Embedder, EmbeddingModel, EmbeddingSpace, Quantization } from './types.js';
/**
 * The space as one readable string, e.g. `'ollama/qwen3-embedding:0.6b@<digest>/1024/l2/f32/i1'`.
 * Int8 made by this package names its calibration: `…/i8@<calibration>/…`. Apps store it next to
 * every vector, so the format never changes.
 *
 * @example
 * await db.insert(indexes).values({ spaceId: spaceId(batch.space) });
 */
export declare function spaceId(space: EmbeddingSpace): string;
/**
 * True when vectors from `a` and `b` are comparable. `revision` counts only when both sides know it.
 *
 * @example
 * if (!isSameSpace(storedSpace, embedder.space)) throw new Error('re-embed the corpus');
 */
export declare function isSameSpace(a: EmbeddingSpace, b: EmbeddingSpace): boolean;
/**
 * The space a model produces at the given output options; `calibration` is the id of a client-side
 * int8 calibration. Read again after a call: Ollama learns its revision lazily.
 */
export declare function spaceOf(model: EmbeddingModel, dimensions: number, quantization: Quantization, calibration?: string): EmbeddingSpace;
/**
 * The embedder's space with its revision known, to compare with a stored space id before anything
 * is embedded. Ollama reads its model digest (one metadata request, no embedding); other models
 * answer at once. A digest it cannot read is `ModelUnavailable` (`unreachable` or `not-pulled`).
 *
 * @example
 * const space = await resolveSpace(embedder);
 * if (!isFailure(space) && !isSameSpace(storedSpace, space)) return SpaceMismatch({ expected: storedSpace, actual: space });
 */
export declare function resolveSpace(embedder: Embedder, options?: {
    readonly signal?: AbortSignal;
}): Promise<EmbeddingSpace | import("./failures.js").EmbedFailure>;
//# sourceMappingURL=space.d.ts.map