/** The `fetch` a fetch-based provider calls. Narrower than `typeof fetch` so a test stub needs no runtime extras. */
export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;
/** Milliseconds to wait from `retry-after-ms`, or `retry-after` as seconds or an HTTP date. */
export declare function retryAfterMs(read: (name: string) => string | null | undefined): number | undefined;
/** The longest a single provider request may take, in milliseconds. The same bound `withResilience` puts on an attempt. */
export declare const REQUEST_TIMEOUT_MS = 60000;
/**
 * The signal a provider request runs under: the caller's `signal` (when given) plus a timeout. A timeout
 * does not abort the caller's signal, so the model reports it as `ModelUnavailable { reason: 'unreachable' }`
 * and a caller's abort stays `Cancelled`.
 */
export declare function requestSignal(signal: AbortSignal | undefined, timeoutMs?: number): AbortSignal;
//# sourceMappingURL=http.d.ts.map