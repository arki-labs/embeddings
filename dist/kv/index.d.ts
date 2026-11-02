/**
 * `@arki/embeddings/kv`: a `CacheStore` over an `@arki/kv` client (or anything with its `get` and
 * `set`), so `withCache` shares vectors across processes through Redis.
 */
import { z } from 'zod';
import type { Failure } from '@arki/failure';
import type { CacheStore } from '../types.js';
/** What `kvCacheStore` stores per key: the cached bytes as base64, because the KV client serialises through JSON. */
declare const storedValueSchema: z.ZodBase64;
/**
 * A `CacheStore` over `kv`. Keys get `prefix` (default `'arki:embeddings:'`); a `ttlMs` becomes
 * whole seconds, rounded up. A stored value that is not base64 (another writer, a stray key) reads
 * as a miss, so `withCache` embeds again instead of decoding junk. A KV failure (Redis down, a
 * cancelled command) is a cache, so it is logged and read as a miss, or the write is skipped.
 *
 * @example
 * const embedder = withCache(base, kvCacheStore(kv, { prefix: 'reader:emb:' }), { ttlMs: 7 * 86_400_000 });
 */
export declare function kvCacheStore(kv: {
    get(key: string, schema: typeof storedValueSchema): Promise<string | undefined | Failure>;
    set(key: string, value: string, expirationSeconds?: number): Promise<unknown>;
}, options?: {
    readonly prefix?: string;
}): CacheStore;
export {};
//# sourceMappingURL=index.d.ts.map