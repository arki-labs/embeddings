import type { Policy, ResilienceFailure } from '@arki/resilience';
import type { Embedder } from './types.js';
/**
 * The same embedder with each `embed` call run through a resilience policy. It retries only
 * `RateLimited` and `ModelUnavailable { reason: 'unreachable' }`;
 * every other failure comes back after one attempt. `usage.requests` counts every attempt. A timeout,
 * an open circuit or a full bulkhead is `ModelUnavailable { reason: 'unreachable' }`, a cancel is
 * `Cancelled`: nothing is thrown for them.
 *
 * Default policy: 3 retries from 200 ms doubling to 5 s with 25% jitter, a breaker that opens after
 * 5 consecutive thrown failures for 30 s, and 60 s per attempt. It waits at least a `RateLimited`'s
 * `retryAfterMs`; one over 5 s is not retried, the `RateLimited` comes back at once.
 *
 * A policy of your own retries what its backoff selects, so build it with
 * `.while(RateLimited, ModelUnavailable)`; it is never handed a failure that must not be retried. It
 * gets no `retryAfterMs` minimum: its backoff's `delay(attempt, reason)` must read
 * `reason.data.retryAfterMs` when `RateLimited.is(reason)` if it should honour it.
 *
 * @example
 * const embedder = withResilience(base); // embedMany(embedder, texts) now retries each chunk
 */
export declare function withResilience(embedder: Embedder, policy?: Policy<never, ResilienceFailure>): Embedder;
//# sourceMappingURL=resilience.d.ts.map