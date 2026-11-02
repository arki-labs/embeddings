import type { FetchLike } from '../http.js';
import type { EmbeddingModel } from '../types.js';
export type VoyageModelOptions = {
    /** Default `'voyage-3.5'`. */
    readonly id?: string;
    readonly apiKey: string;
    /** Default `'https://api.voyageai.com/v1'`. */
    readonly baseURL?: string;
    readonly fetch?: FetchLike;
};
/** `VoyageModelOptions`, checked by `createVoyageModel`; a type test locks it to the type. */
export declare const voyageModelOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
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
 * A Voyage model record. Voyage versions its models by name, so `assurance` is `immutable`.
 *
 * @example
 * const model = createVoyageModel({ id: 'voyage-3.5', apiKey: process.env['VOYAGE_API_KEY'] ?? '' });
 */
export declare function createVoyageModel(input: VoyageModelOptions): EmbeddingModel | import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}>;
export { createVoyageReranker, voyageRerankerOptionsSchema } from './rerank.js';
export type { VoyageRerankerOptions } from './rerank.js';
//# sourceMappingURL=index.d.ts.map