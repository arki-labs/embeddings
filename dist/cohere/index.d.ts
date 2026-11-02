import type { FetchLike } from '../http.js';
import type { EmbeddingModel } from '../types.js';
export type CohereModelOptions = {
    /** Default `'embed-v4.0'`. */
    readonly id?: string;
    readonly apiKey: string;
    /** Default `'https://api.cohere.com'`. */
    readonly baseURL?: string;
    readonly fetch?: FetchLike;
};
/** `CohereModelOptions`, checked by `createCohereModel`; a type test locks it to the type. */
export declare const cohereModelOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
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
 * A Cohere model record. Cohere versions its models by name, so `assurance` is `immutable`.
 *
 * @example
 * const model = createCohereModel({ id: 'embed-v4.0', apiKey: process.env['COHERE_API_KEY'] ?? '' });
 */
export declare function createCohereModel(input: CohereModelOptions): EmbeddingModel | import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}>;
export { cohereCompatibleRerankerOptionsSchema, cohereRerankerOptionsSchema, createCohereCompatibleReranker, createCohereReranker, } from './rerank.js';
export type { CohereCompatibleRerankerOptions, CohereRerankerOptions } from './rerank.js';
//# sourceMappingURL=index.d.ts.map