import type { FetchLike } from '../http.js';
import type { Reranker } from '../rerank/index.js';
import { ConfigurationFailure } from '../failures.js';
export type VoyageRerankerOptions = {
    /** Default `'rerank-2.5'`. */
    readonly id?: string;
    readonly apiKey: string;
    /** Default `'https://api.voyageai.com/v1'`. */
    readonly baseURL?: string;
    readonly fetch?: FetchLike;
};
/** `VoyageRerankerOptions`, checked by `createVoyageReranker`; a type test locks it to the type. */
export declare const voyageRerankerOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
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
 * A Voyage reranker. `truncation` is sent as the caller chose, so a document over the limit is
 * refused (`InputTooLong`) unless `rerank()` was told to truncate.
 *
 * @example
 * const reranker = createVoyageReranker({ apiKey: process.env['VOYAGE_API_KEY'] ?? '', id: 'rerank-2.5-lite' });
 */
export declare function createVoyageReranker(input: VoyageRerankerOptions): Reranker | ConfigurationFailure;
//# sourceMappingURL=rerank.d.ts.map