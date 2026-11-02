import type { FetchLike } from '../http.js';
import type { EmbeddingModel } from '../types.js';
export type JinaModelOptions = {
    /** Default `'jina-embeddings-v3'`. */
    readonly id?: string;
    readonly apiKey: string;
    /** Default `'https://api.jina.ai/v1'`. */
    readonly baseURL?: string;
    readonly fetch?: FetchLike;
};
/** `JinaModelOptions`, checked by `createJinaModel`; a type test locks it to the type. */
export declare const jinaModelOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    id?: string | undefined;
    apiKey: string;
    baseURL?: string | undefined;
    fetch?: FetchLike | undefined;
}>, Readonly<{
    id?: string | undefined;
    apiKey: string;
    baseURL?: string | undefined;
    fetch?: FetchLike | undefined;
}>>;
/**
 * A Jina model record. Jina versions its models by name, so `assurance` is `immutable`.
 *
 * @example
 * const model = createJinaModel({ apiKey: process.env['JINA_API_KEY'] ?? '' });
 */
export declare function createJinaModel(input: JinaModelOptions): EmbeddingModel | import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}>;
export { createJinaReranker, jinaRerankerOptionsSchema } from './rerank.js';
export type { JinaRerankerOptions } from './rerank.js';
//# sourceMappingURL=index.d.ts.map