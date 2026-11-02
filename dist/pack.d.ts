import type { EmbeddingModel, EmbedInput } from './types.js';
/** A run of consecutive inputs sent as one request: `inputs.slice(start, end)`. */
export type Chunk = {
    readonly start: number;
    readonly end: number;
};
/**
 * Splits inputs, in order, into chunks of at most `model.maxBatch` inputs and `model.maxBatchTokens`
 * tokens. An input over `maxInputTokens` (unless truncating) or alone over `maxBatchTokens` is refused
 * before any chunk is sent. With `truncate`, an input costs at most `model.maxInputTokens`: that is
 * all of it the provider gets.
 */
export declare function pack(model: EmbeddingModel, inputs: readonly EmbedInput[], truncate?: boolean): Chunk[] | import("@arki/failure").Failure<"embeddings.input_too_long", {
    index: number;
    tokens: import("./types.js").TokenCount;
    max: number;
}>;
//# sourceMappingURL=pack.d.ts.map