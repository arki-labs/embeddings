import type { FetchLike } from '../http.js';
import type { EmbeddingModel, Instruction } from '../types.js';
export type OpenAICompatibleModelOptions = {
    /** The model name the server expects, e.g. `'Qwen/Qwen3-Embedding-8B'`. */
    readonly id: string;
    /** Up to and including the version segment, e.g. `'https://api.tokenfactory.nebius.com/v1'`. */
    readonly baseURL: string;
    /** Sent as `Authorization: Bearer <apiKey>`. Local servers often need none. */
    readonly apiKey?: string;
    /** The model's native output size. */
    readonly dimensions: number;
    /** Inputs per request. Default 256. */
    readonly maxBatch?: number;
    /** Tokens per request. Default 300 000. */
    readonly maxBatchTokens?: number;
    /** Default 8192. */
    readonly maxInputTokens?: number;
    /** Whether the server answers unit-length vectors. Default `true`. */
    readonly normalized?: boolean;
    /** Default: `QWEN3_INSTRUCTION` for a Qwen3-Embedding id, else no prefix. */
    readonly instruction?: Instruction;
    /** Names the server in failure messages, e.g. `'nebius'`. Default `'openai-compatible'`. */
    readonly label?: string;
    readonly fetch?: FetchLike;
};
/** `OpenAICompatibleModelOptions`, checked by `createOpenAICompatibleModel`; a type test locks it to the type. */
export declare const openaiCompatibleModelOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    id: string;
    baseURL: string;
    apiKey?: string | undefined;
    dimensions: number;
    maxBatch?: number | undefined;
    maxBatchTokens?: number | undefined;
    maxInputTokens?: number | undefined;
    normalized?: boolean | undefined;
    instruction?: (Readonly<Partial<Record<"classification" | "clustering" | "document" | "query" | "similarity", string>>> & Readonly<{
        version: number;
    }>) | undefined;
    label?: string | undefined;
    fetch?: FetchLike | undefined;
}>, Readonly<{
    id: string;
    baseURL: string;
    apiKey?: string | undefined;
    dimensions: number;
    maxBatch?: number | undefined;
    maxBatchTokens?: number | undefined;
    maxInputTokens?: number | undefined;
    normalized?: boolean | undefined;
    instruction?: (Readonly<Partial<Record<"classification" | "clustering" | "document" | "query" | "similarity", string>>> & Readonly<{
        version: number;
    }>) | undefined;
    label?: string | undefined;
    fetch?: FetchLike | undefined;
}>>;
/**
 * A model record for an OpenAI-compatible server. The operator decides what the id serves, so
 * `assurance` is `operator-pinned`.
 *
 * @example
 * const model = createOpenAICompatibleModel({ id: 'Qwen/Qwen3-Embedding-8B', baseURL: 'https://api.example.com/v1', dimensions: 4096 });
 */
export declare function createOpenAICompatibleModel(input: OpenAICompatibleModelOptions): EmbeddingModel | import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}>;
//# sourceMappingURL=index.d.ts.map