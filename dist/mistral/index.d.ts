import type { EmbeddingModel } from '../types.js';
import type { FetchLike } from '../http.js';
export type MistralModelOptions = {
    /** Default `'mistral-embed'`. */
    readonly id?: string;
    readonly apiKey: string;
    /** Default: the SDK's `https://api.mistral.ai/v1`. */
    readonly baseURL?: string;
    /** Replaces the global `fetch`; tests inject a stub here. */
    readonly fetch?: FetchLike;
};
/** `MistralModelOptions`, checked by `createMistralModel`; a type test locks it to the type. */
export declare const mistralModelOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
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
 * A Mistral model record. `mistral-embed` is a moving name (the dated `mistral-embed-2312` is a
 * different id), so `assurance` is `mutable`. `purpose` is ignored: the API has no such field.
 *
 * @example
 * const model = createMistralModel({ apiKey: process.env.MISTRAL_API_KEY ?? '' });
 */
export declare function createMistralModel(input: MistralModelOptions): EmbeddingModel | import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}>;
//# sourceMappingURL=index.d.ts.map