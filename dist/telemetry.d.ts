import type { Embedder, EmbeddingsLogger } from './types.js';
/** Options `withTelemetry` takes. */
type TelemetryOptions = {
    /** Where the `arki.embed` events go. Default: `getLogger('arki:embeddings')`. */
    readonly log?: EmbeddingsLogger;
    /**
     * Put the input texts on the event (images as `'<image>'`). Default `false`: inputs carry emails,
     * names and tokens, and a log is the wrong place for them.
     */
    readonly recordInputs?: boolean;
};
/**
 * The same embedder with one `arki.embed` event per `embed` call, at `info`. `@arki/log` has no
 * span type, so the event is the span: it carries the duration and, through `@arki/log/otel`, the
 * active trace. Fields: `provider`, `model`, `dimensions`, `inputs` (the count), `tokenBasis`,
 * `tokens`, `requests`, `cacheHits`, `durationMs` and `outcome` (`'ok'` or the failure's code).
 * Input texts are left out unless `recordInputs: true`.
 *
 * Wrap it outside `withCache` to see hits, inside it to see only provider calls.
 *
 * @example
 * const embedder = withTelemetry(withCache(base)); // one event per call, cache hits counted
 */
export declare function withTelemetry(embedder: Embedder, options?: TelemetryOptions): Embedder;
export {};
//# sourceMappingURL=telemetry.d.ts.map