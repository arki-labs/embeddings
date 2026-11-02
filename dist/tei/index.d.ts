import type { FetchLike } from '../http.js';
import type { Reranker } from '../rerank/index.js';
import { ConfigurationFailure } from '../failures.js';
export type TeiRerankerOptions = {
    /** The model the server runs, e.g. `'BAAI/bge-reranker-v2-m3'`. TEI takes no model field; this names the scores. */
    readonly id: string;
    /** The server root, e.g. `'http://127.0.0.1:8080'`. */
    readonly baseURL: string;
    /** Sent as `Authorization: Bearer <apiKey>`. Local servers need none. */
    readonly apiKey?: string;
    /** HF commit the server runs. Part of the cache key. */
    readonly revision?: string;
    /** TEI `--max-client-batch-size`. Default 32. */
    readonly maxDocuments?: number;
    /** TEI `max_input_length` for query plus one document. Default 512. */
    readonly maxInputTokens?: number;
    readonly fetch?: FetchLike;
};
/** `TeiRerankerOptions`, checked by `createTeiReranker`; a type test locks it to the type. */
export declare const teiRerankerOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    id: string;
    baseURL: string;
    apiKey?: string | undefined;
    revision?: string | undefined;
    maxDocuments?: number | undefined;
    maxInputTokens?: number | undefined;
    fetch?: FetchLike | undefined;
}>, Readonly<{
    id: string;
    baseURL: string;
    apiKey?: string | undefined;
    revision?: string | undefined;
    maxDocuments?: number | undefined;
    maxInputTokens?: number | undefined;
    fetch?: FetchLike | undefined;
}>>;
/**
 * A TEI reranker. `truncate` is sent as the caller chose (TEI's own default is `false`), so a pair
 * over `max_input_length` is `InputTooLong` unless `rerank()` was told to truncate. Scores are
 * TEI's normalised ones (`raw_scores: false`).
 *
 * @example
 * // text-embeddings-router --model-id BAAI/bge-reranker-v2-m3 --max-client-batch-size 32
 * const reranker = createTeiReranker({ id: 'BAAI/bge-reranker-v2-m3', baseURL: 'http://127.0.0.1:8080', maxInputTokens: 1024 });
 * if (isFailure(reranker)) throw new Error(reranker.message);
 */
export declare function createTeiReranker(input: TeiRerankerOptions): Reranker | ConfigurationFailure;
//# sourceMappingURL=index.d.ts.map