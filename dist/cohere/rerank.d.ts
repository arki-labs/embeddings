import type { FetchLike } from '../http.js';
import type { Reranker } from '../rerank/index.js';
import { ConfigurationFailure } from '../failures.js';
export type CohereRerankerOptions = {
    /** Default `'rerank-v3.5'`. */
    readonly id?: string;
    readonly apiKey: string;
    /** Default `'https://api.cohere.com/v2'`. */
    readonly baseURL?: string;
    readonly fetch?: FetchLike;
};
export type CohereCompatibleRerankerOptions = {
    /** The server root, e.g. `'http://127.0.0.1:7997'`; `/rerank` is appended. */
    readonly baseURL: string;
    /** The model the server runs, sent as `model`, e.g. `'BAAI/bge-reranker-v2-m3'`. */
    readonly id: string;
    /** Sent as `Authorization: Bearer <apiKey>`. Local servers need none. */
    readonly apiKey?: string;
    /** The weights' commit, when you pin it on the server. Part of the cache key. */
    readonly revision?: string;
    /** Default 1000. Infinity takes up to 2048. */
    readonly maxDocuments?: number;
    /** Tokens of query plus one document the server's model reads. Default 512. */
    readonly maxInputTokens?: number;
    readonly fetch?: FetchLike;
};
/** `CohereRerankerOptions`, checked by `createCohereReranker`; a type test locks it to the type. */
export declare const cohereRerankerOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
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
/** `CohereCompatibleRerankerOptions`, checked by `createCohereCompatibleReranker`; a type test locks it. */
export declare const cohereCompatibleRerankerOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    baseURL: string;
    id: string;
    apiKey?: string | undefined;
    revision?: string | undefined;
    maxDocuments?: number | undefined;
    maxInputTokens?: number | undefined;
    fetch?: FetchLike | undefined;
}>, Readonly<{
    baseURL: string;
    id: string;
    apiKey?: string | undefined;
    revision?: string | undefined;
    maxDocuments?: number | undefined;
    maxInputTokens?: number | undefined;
    fetch?: FetchLike | undefined;
}>>;
/**
 * A Cohere reranker. Cohere has no "refuse a long document" switch: past `maxInputTokens` it cuts or
 * chunks on its side, so `rerank()`'s length check is the only guard under `'fail'`. That check
 * estimates 4 characters per token, which undercounts Romanian (near 3) and CJK text (near 1): such
 * a document can pass it and be cut by Cohere. Split such text before ranking.
 *
 * @example
 * const reranker = createCohereReranker({ apiKey: process.env['COHERE_API_KEY'] ?? '' });
 * if (isFailure(reranker)) throw new Error(reranker.message);
 * const ranked = await rerank(reranker, 'refund policy', hits, { text: hit => hit.text, topK: 10 });
 */
export declare function createCohereReranker(input: CohereRerankerOptions): Reranker | ConfigurationFailure;
/**
 * A reranker on a server that speaks Cohere's protocol: Infinity, vLLM or llama.cpp started with
 * `--reranking`. The operator decides what the server runs, so state `maxInputTokens` and, to key
 * a cache on the weights, `revision`.
 *
 * @example
 * // infinity_emb v2 --model-id BAAI/bge-reranker-v2-m3
 * const reranker = createCohereCompatibleReranker({ baseURL: 'http://127.0.0.1:7997', id: 'BAAI/bge-reranker-v2-m3', maxInputTokens: 1024 });
 */
export declare function createCohereCompatibleReranker(input: CohereCompatibleRerankerOptions): Reranker | ConfigurationFailure;
//# sourceMappingURL=rerank.d.ts.map