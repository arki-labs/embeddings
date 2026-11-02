import type { EmbedFailure } from '../failures.js';
import type { CacheStore, Embedder, EmbeddingModel } from '../types.js';
import { withResilience } from '../resilience.js';
/** Options `embeddings()` takes. Everything is read once, at boot. */
export type EmbeddingsPluginOptions = {
    /**
     * A model record, an `Embedder`, or a function returning one of them or a failure. The function
     * runs once, at boot: read the app's env there and build the model with its provider's
     * `createXModel`. A failure it returns (a `ConfigurationFailure` for a missing key) stops the boot.
     */
    readonly model: EmbeddingModel | Embedder | (() => EmbeddingModel | Embedder | EmbedFailure);
    /** `true`: `withCache` over a `memoryCacheStore()`; a store: `withCache` over it. Default `false`. */
    readonly cache?: boolean | CacheStore;
    /** `true`: `withResilience` with its default policy; a policy: that one. Default `false`. */
    readonly resilience?: boolean | NonNullable<Parameters<typeof withResilience>[1]>;
};
/** `EmbeddingsPluginOptions`, checked when `embeddings()` boots; a type test locks it to the type. */
export declare const embeddingsPluginOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    model: Embedder | EmbeddingModel | (() => EmbeddingModel | Embedder | EmbedFailure);
    cache?: boolean | CacheStore | undefined;
    resilience?: boolean | (import("@arki/resilience").PolicyExecution<never, import("@arki/resilience").ResilienceFailure> & {
        readonly onSuccess: import("@arki/resilience").PolicyEvent<import("@arki/resilience").SuccessEvent>;
        readonly onFailure: import("@arki/resilience").PolicyEvent<import("@arki/resilience").FailureEvent>;
    }) | undefined;
}>, Readonly<{
    model: Embedder | EmbeddingModel | (() => EmbeddingModel | Embedder | EmbedFailure);
    cache?: boolean | CacheStore | undefined;
    resilience?: boolean | (import("@arki/resilience").PolicyExecution<never, import("@arki/resilience").ResilienceFailure> & {
        readonly onSuccess: import("@arki/resilience").PolicyEvent<import("@arki/resilience").SuccessEvent>;
        readonly onFailure: import("@arki/resilience").PolicyEvent<import("@arki/resilience").FailureEvent>;
    }) | undefined;
}>>;
/**
 * Publish `embedder`: the app's one `Embedder`, built once at boot. A configuration that does not
 * build (a bad option, a missing key, a size the model refuses) stops the boot: `boot()` returns
 * that failure, a `ConfigurationFailure` for configuration faults. An app never runs with embeddings
 * silently off. An app that can run without embeddings must not mount this unit.
 *
 * @example
 * const embedding = embeddings({
 *   model: () => createOllamaModel({ id: 'qwen3-embedding:0.6b', baseURL: process.env['OLLAMA_BASE_URL'] }),
 *   cache: true,
 * });
 * defineApp('reader').infra(embedding);
 * // in a feature: needs: { embedder: embedding.provides.embedder } → Embedder
 */
export declare function embeddings(options: EmbeddingsPluginOptions): Omit<import("@arki/dot/unit").Unit<import("@arki/dot/unit").WireNeeds<import("@arki/dot/unit").EmptyShape>, import("@arki/dot/unit").ProvidedValues<{
    embedder: Embedder | EmbedFailure;
}>, import("@arki/dot/unit").EmptyShape, "embeddings", import("@arki/dot/unit").EmptyOwnership, import("@arki/dot/unit").EmptyPhases>, "factories" | "hooks" | "logging"> & import("@arki/dot/unit").LoggingSlot<import("@arki/dot/unit").DotLoggingHandle<undefined>> & import("@arki/dot/unit").FactoryContract<import("@arki/dot/unit").ProvidedValues<{
    embedder: Embedder | EmbedFailure;
}>> & {
    readonly factories: {
        readonly embedder: (ctx: never) => Embedder | EmbedFailure;
    };
    readonly hooks: import("@arki/dot/unit").PhaseHooks<never, {
        readonly configure: undefined;
        readonly start: undefined;
        readonly stop: undefined;
        readonly dispose: undefined;
    }, import("@arki/dot/unit").DotConfigureContext> & import("@arki/dot/unit").BootSlot<import("@arki/dot/unit").CtxOf<import("@arki/dot/unit").EmptyShape> & import("@arki/dot/unit").ProvidedValues<{
        embedder: Embedder | EmbedFailure;
    }> & import("@arki/dot/unit").KernelCtx, undefined>;
} & import("@arki/dot/unit").InfraRole;
//# sourceMappingURL=index.d.ts.map