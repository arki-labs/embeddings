import type { Embedder, EmbedMiddleware } from './types.js';
/**
 * The same embedder with its `embed` wrapped by each middleware, the first one outermost: it sees
 * the call first and the result last. `model` and `space` stay the wrapped embedder's own.
 *
 * @example
 * const embedder = withMiddleware(base, logCalls, countCalls); // logCalls wraps countCalls wraps base
 */
export declare function withMiddleware(embedder: Embedder, ...middleware: readonly EmbedMiddleware[]): Embedder;
//# sourceMappingURL=middleware.d.ts.map