import type { EmbeddingModel } from '../types.js';
export type OpenAIModelOptions = {
    /** Default `'text-embedding-3-small'`. */
    readonly id?: string;
    readonly apiKey: string;
    /** An OpenAI-compatible base URL, e.g. a proxy. Default: the SDK's. */
    readonly baseURL?: string;
};
/** `OpenAIModelOptions`, checked by `createOpenAIModel`; a type test locks it to the type. */
export declare const openaiModelOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    id?: string | undefined;
    apiKey: string;
    baseURL?: string | undefined;
}>, Readonly<{
    id?: string | undefined;
    apiKey: string;
    baseURL?: string | undefined;
}>>;
/**
 * An OpenAI model record. Snapshot ids never change their vectors, so `assurance` is `immutable`.
 *
 * @example
 * const model = createOpenAIModel({ id: 'text-embedding-3-small', apiKey: process.env.OPENAI_API_KEY ?? '' });
 */
export declare function createOpenAIModel(input: OpenAIModelOptions): EmbeddingModel | import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}>;
//# sourceMappingURL=index.d.ts.map