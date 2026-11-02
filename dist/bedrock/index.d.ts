import type { FetchLike } from '../http.js';
import type { EmbeddingModel } from '../types.js';
export type BedrockModelOptions = {
    /** Default `'amazon.titan-embed-text-v2:0'`. */
    readonly id?: string;
    /** Default: the SDK reads `AWS_REGION`. */
    readonly region?: string;
    /** A Bedrock API key (bearer token). Default: the SDK reads `AWS_BEARER_TOKEN_BEDROCK`. */
    readonly apiKey?: string;
    /** Default: the SDK reads `AWS_ACCESS_KEY_ID`. */
    readonly accessKeyId?: string;
    /** Default: the SDK reads `AWS_SECRET_ACCESS_KEY`. */
    readonly secretAccessKey?: string;
    /** Default: the SDK reads `AWS_SESSION_TOKEN`. */
    readonly sessionToken?: string;
    /** Default: the regional `bedrock-runtime` endpoint. */
    readonly baseURL?: string;
    /** Replaces the global `fetch`; tests inject a stub here. */
    readonly fetch?: FetchLike;
};
/** `BedrockModelOptions`, checked by `createBedrockModel`; a type test locks it to the type. */
export declare const bedrockModelOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    id?: string | undefined;
    region?: string | undefined;
    apiKey?: string | undefined;
    accessKeyId?: string | undefined;
    secretAccessKey?: string | undefined;
    sessionToken?: string | undefined;
    baseURL?: string | undefined;
    fetch?: FetchLike | undefined;
}>, Readonly<{
    id?: string | undefined;
    region?: string | undefined;
    apiKey?: string | undefined;
    accessKeyId?: string | undefined;
    secretAccessKey?: string | undefined;
    sessionToken?: string | undefined;
    baseURL?: string | undefined;
    fetch?: FetchLike | undefined;
}>>;
/**
 * A Bedrock Titan model record. Titan ids are versioned (`:0`), so `assurance` is `immutable`.
 *
 * @example
 * const model = createBedrockModel({ region: 'us-east-1' });
 */
export declare function createBedrockModel(input?: BedrockModelOptions): EmbeddingModel | import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}>;
//# sourceMappingURL=index.d.ts.map