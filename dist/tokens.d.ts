import type { EmbeddingModel, EmbedInput, TokenCount } from './types.js';
/** The text part of an input; `''` for an image-only input. */
export declare function textOf(input: EmbedInput): string;
/** Characters per token the estimate assumes; also where `onTooLong: 'truncate'` cuts without a tokenizer. */
export declare const CHARS_PER_TOKEN = 4;
/**
 * Tokens one input costs. `counted` when the model record carries a tokenizer (`model.countTokens`,
 * as `./transformers` records do), otherwise `estimated` as `ceil(characters / 4)`; a provider's own
 * count replaces an estimate in `usage` when it reports one.
 *
 * @example
 * countTokens(model, 'twelve chars'); // { basis: 'estimated', count: 3 }
 */
export declare function countTokens(model: EmbeddingModel, input: EmbedInput): TokenCount;
/**
 * `text` cut where `onTooLong: 'truncate'` cuts without a tokenizer: its first `maxTokens * 4` UTF-16
 * code units, less a high surrogate left last, so a character is never split in half.
 *
 * @example
 * truncateByEstimate('a'.repeat(7) + '😀', 2); // 'aaaaaaa': the emoji is dropped whole
 */
export declare function truncateByEstimate(text: string, maxTokens: number): string;
/** Sums counts; the basis is the weakest seen (`reported` > `counted` > `estimated`; any `unknown` → `unknown`). */
export declare function addTokens(a: TokenCount, b: TokenCount): TokenCount;
//# sourceMappingURL=tokens.d.ts.map