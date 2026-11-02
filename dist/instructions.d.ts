import type { Instruction } from './types.js';
/**
 * Qwen3-Embedding was trained with this prefix on queries and none on documents.
 *
 * @example
 * createOpenAICompatibleModel({ id: 'my-model', baseURL, dimensions: 1024, instruction: QWEN3_INSTRUCTION });
 */
export declare const QWEN3_INSTRUCTION: Instruction;
/**
 * Symmetric models (OpenAI, the fake): text goes in as it is.
 *
 * @example
 * createOpenAICompatibleModel({ id: 'my-model', baseURL, dimensions: 768, instruction: NO_INSTRUCTION });
 */
export declare const NO_INSTRUCTION: Instruction;
/**
 * EmbeddingGemma's task prompts, from its model card. A document's title is unknown here, so it is
 * `none`, as the card says to write it.
 *
 * @example
 * createOllamaModel({ id: 'embeddinggemma' }).instruction === EMBEDDINGGEMMA_INSTRUCTION; // true
 */
export declare const EMBEDDINGGEMMA_INSTRUCTION: Instruction;
/**
 * EmbeddingGemma 2's task prompts (huggingface.co/google/embeddinggemma-2, read 2026-10-21). Today
 * they equal EmbeddingGemma's; its own `version` lets one card change without re-embedding the other.
 *
 * @example
 * createTransformersModel({ id: 'onnx-community/embeddinggemma-2-ONNX' }); // instruction: EMBEDDINGGEMMA_2_INSTRUCTION
 */
export declare const EMBEDDINGGEMMA_2_INSTRUCTION: Instruction;
/**
 * Gemini Embedding 2's prefixes (ai.google.dev/gemini-api/docs/embeddings, read 2026-10-21). Today
 * they equal EmbeddingGemma's, but each model keeps its own `version`, so one model card changing a
 * prefix re-embeds only that model's corpora.
 */
export declare const GEMINI_EMBEDDING_2_INSTRUCTION: Instruction;
/**
 * nomic-embed-text's task prefixes. It has none for similarity, so that purpose goes in as it is.
 *
 * @example
 * createOllamaModel({ id: 'nomic-embed-text' }).instruction === NOMIC_INSTRUCTION; // true
 */
export declare const NOMIC_INSTRUCTION: Instruction;
/**
 * The E5 family (`intfloat/e5-*`, `multilingual-e5-*`): `query: ` on queries, `passage: ` on documents.
 *
 * @example
 * createOpenAICompatibleModel({ id: 'intfloat/multilingual-e5-large', baseURL, dimensions: 1024, instruction: E5_INSTRUCTION });
 */
export declare const E5_INSTRUCTION: Instruction;
//# sourceMappingURL=instructions.d.ts.map