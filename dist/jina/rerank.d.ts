import type { FetchLike } from '../http.js';
import type { Reranker } from '../rerank/index.js';
import { ConfigurationFailure } from '../failures.js';
export type JinaRerankerOptions = {
    /** Default `'jina-reranker-v2-base-multilingual'`. */
    readonly id?: string;
    readonly apiKey: string;
    /** Default `'https://api.jina.ai/v1'`. */
    readonly baseURL?: string;
    readonly fetch?: FetchLike;
};
/** `JinaRerankerOptions`, checked by `createJinaReranker`; a type test locks it to the type. */
export declare const jinaRerankerOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
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
 * A Jina reranker. Jina has no documented "refuse a long document" switch: it chunks on its side,
 * so `rerank()`'s length check is the only guard under `'fail'`. That check estimates 4 characters
 * per token, which undercounts Romanian (near 3) and CJK text (near 1).
 *
 * @example
 * const reranker = createJinaReranker({ apiKey: process.env['JINA_API_KEY'] ?? '' });
 */
export declare function createJinaReranker(input: JinaRerankerOptions): Reranker | ConfigurationFailure;
//# sourceMappingURL=rerank.d.ts.map