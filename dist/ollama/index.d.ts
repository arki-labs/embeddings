import type { FetchLike } from '../http.js';
import type { EmbeddingModel, Instruction } from '../types.js';
export type OllamaModelOptions = {
    /** Default `'qwen3-embedding:0.6b'`. */
    readonly id?: string;
    /** Default `'http://127.0.0.1:11434'`. */
    readonly baseURL?: string;
    /** Ollama `keep_alive`: how long the model stays loaded after a call (`'5m'`, seconds, `-1`). */
    readonly keepAlive?: string | number;
    /**
     * Required for a model id not in the facts table: its native output size. For a known id, its
     * native size or one of its Matryoshka sizes; any other value is a `ConfigurationFailure`.
     */
    readonly dimensions?: number;
    /** Overrides the facts table's prefixes, e.g. to keep querying a corpus embedded without one. */
    readonly instruction?: Instruction;
    readonly fetch?: FetchLike;
};
/** `OllamaModelOptions`, checked by `createOllamaModel`; a type test locks it to the type. */
export declare const ollamaModelOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    id?: string | undefined;
    baseURL?: string | undefined;
    keepAlive?: string | number | undefined;
    dimensions?: number | undefined;
    instruction?: (Readonly<Partial<Record<"classification" | "clustering" | "document" | "query" | "similarity", string>>> & Readonly<{
        version: number;
    }>) | undefined;
    fetch?: FetchLike | undefined;
}>, Readonly<{
    id?: string | undefined;
    baseURL?: string | undefined;
    keepAlive?: string | number | undefined;
    dimensions?: number | undefined;
    instruction?: (Readonly<Partial<Record<"classification" | "clustering" | "document" | "query" | "similarity", string>>> & Readonly<{
        version: number;
    }>) | undefined;
    fetch?: FetchLike | undefined;
}>>;
/**
 * An Ollama model record. `revision` is the model digest, read once from `/api/tags` on the
 * first call (resolving a model must never touch the network), so it is `undefined` until then.
 *
 * @example
 * const model = createOllamaModel({ id: 'qwen3-embedding:0.6b', baseURL: 'http://127.0.0.1:11434' });
 */
export declare function createOllamaModel(input?: OllamaModelOptions): EmbeddingModel | import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}>;
//# sourceMappingURL=index.d.ts.map