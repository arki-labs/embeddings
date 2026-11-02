import type { EmbeddingModel } from '../types.js';
import type { FetchLike } from '../http.js';
export type GoogleModelOptions = {
    /** Default `'gemini-embedding-001'`. */
    readonly id?: string;
    readonly apiKey: string;
    /** Default: the SDK's `https://generativelanguage.googleapis.com/v1beta`. */
    readonly baseURL?: string;
    /** Replaces the global `fetch`; tests inject a stub here. */
    readonly fetch?: FetchLike;
};
/** `GoogleModelOptions`, checked by `createGoogleModel`; a type test locks it to the type. */
export declare const googleModelOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
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
 * A Google Gemini model record. The ids are moving names, not dated snapshots, so `assurance` is `mutable`.
 *
 * @example
 * const model = createGoogleModel({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '' });
 */
export declare function createGoogleModel(input: GoogleModelOptions): EmbeddingModel | import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}>;
//# sourceMappingURL=index.d.ts.map