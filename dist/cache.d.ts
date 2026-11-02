import type { CacheStore, Embedder } from './types.js';
/** Options `withCache` takes after the store. */
type CacheOptions = {
    /**
     * `true` (default): a cached vector whose length or dtype disagrees with the space is
     * `InvalidOutput`. `false`: such an entry counts as a miss and is embedded again.
     */
    readonly strict?: boolean;
    /** Mixed into every key, so two caches can share one store without sharing entries. */
    readonly namespace?: string;
    /** Passed to `store.set`; absent = the store's own default (no expiry for `memoryCacheStore`). */
    readonly ttlMs?: number;
};
/**
 * The same embedder with a vector cache in front. Cached inputs are filled from `store`; the
 * rest go to the provider as one call, in order. A key covers the space, the purpose, the
 * truncation choice, the namespace and the exact text, so a model, size or prompt change misses
 * instead of answering a wrong vector in the right shape. Image inputs always go to the provider.
 * `usage.cacheHits` counts the inputs the store answered.
 *
 * A store that throws is treated as a miss (reads) or skipped (writes) and logged at `warn`.
 * In strict mode, an entry that is not a vector of the space (another writer's value under the
 * key) fails every call that reads it until it expires, so set `ttlMs` on a shared store.
 *
 * @example
 * const embedder = withCache(base, memoryCacheStore({ maxEntries: 50_000 }));
 */
export declare function withCache(embedder: Embedder, store?: CacheStore, options?: CacheOptions): Embedder;
/**
 * An in-process LRU `CacheStore`. It copies on `set` and on `get`, so a caller that changes a
 * returned vector never changes the cache. The oldest-read entry goes first once `maxEntries`
 * (default 10 000) is reached; an entry set with `ttlMs` is gone after that many milliseconds.
 *
 * @example
 * const store = memoryCacheStore({ maxEntries: 50_000 });
 */
export declare function memoryCacheStore(options?: {
    readonly maxEntries?: number;
}): CacheStore;
export {};
//# sourceMappingURL=cache.d.ts.map