import type { EmbeddingSpace, TokenCount } from './types.js';
/**
 * The embedding provider is rate limiting this caller.
 * @fix Wait retryAfterMs (when set) and try again, or wrap the embedder in withResilience.
 * @verify bun run test -- src/failures.test.ts src/embed.test.ts
 */
export declare const RateLimited: import("@arki/failure").FailureDefinition<"embeddings.rate_limited", import("@standard-schema/spec").StandardSchemaV1<{
    retryAfterMs?: number | undefined;
}, {
    retryAfterMs?: number | undefined;
}>>;
/**
 * An input exceeds the embedding model token limit.
 * @fix Split the text into smaller chunks before embedding it.
 * @verify bun run test -- src/failures.test.ts src/embed.test.ts
 */
export declare const InputTooLong: import("@arki/failure").FailureDefinition<"embeddings.input_too_long", import("@standard-schema/spec").StandardSchemaV1<{
    index: number;
    tokens: TokenCount;
    max: number;
}, {
    index: number;
    tokens: TokenCount;
    max: number;
}>>;
/**
 * The embedding model or its provider is unavailable.
 * @fix not-pulled: run `ollama pull <model>`; unreachable: start the server or fix the base URL; peer-missing: install the provider SDK peer.
 * @verify bun run test -- src/failures.test.ts src/embed.test.ts
 */
export declare const ModelUnavailable: import("@arki/failure").FailureDefinition<"embeddings.model_unavailable", import("@standard-schema/spec").StandardSchemaV1<{
    model: string;
    reason: "not-pulled" | "peer-missing" | "unknown-model" | "unreachable";
}, {
    model: string;
    reason: "not-pulled" | "peer-missing" | "unknown-model" | "unreachable";
}>>;
/**
 * The embedding model does not support this input type.
 * @fix Remove the unsupported input part or option, or select a model that supports it.
 * @verify bun run test -- src/failures.test.ts src/embed.test.ts
 */
export declare const UnsupportedInput: import("@arki/failure").FailureDefinition<"embeddings.unsupported_input", import("@standard-schema/spec").StandardSchemaV1<{
    index: number;
    part: "batch" | "dimensions" | "image" | "quantization" | "text";
}, {
    index: number;
    part: "batch" | "dimensions" | "image" | "quantization" | "text";
}>>;
/**
 * The provider returned an unusable embedding.
 * @fix Inspect the provider response and adapter validation; use a provider and model returning the required finite embedding vector shape.
 * @verify bun run test -- src/failures.test.ts src/embed.test.ts
 */
export declare const InvalidOutput: import("@arki/failure").FailureDefinition<"embeddings.invalid_output", import("@standard-schema/spec").StandardSchemaV1<{
    reason: string;
}, {
    reason: string;
}>>;
/**
 * The configured model does not match the index embedding space.
 * @fix Re-embed the corpus in the new space, or configure the model the index was built with.
 * @verify bun run test -- src/failures.test.ts src/embed.test.ts
 */
export declare const SpaceMismatch: import("@arki/failure").FailureDefinition<"embeddings.space_mismatch", import("@standard-schema/spec").StandardSchemaV1<{
    expected: EmbeddingSpace;
    actual: EmbeddingSpace;
}, {
    expected: EmbeddingSpace;
    actual: EmbeddingSpace;
}>>;
/**
 * The embedding call was cancelled.
 * @fix Start a new request with an active AbortSignal if the embedding is still needed.
 * @verify bun run test -- src/failures.test.ts src/embed.test.ts
 */
export declare const Cancelled: import("@arki/failure").FailureDefinition<"embeddings.cancelled", undefined>;
/**
 * The embedding provider, model or connection is misconfigured.
 * @fix Correct the configured provider, model and connection settings identified by the configuration failure.
 * @verify bun run test -- src/failures.test.ts src/embed.test.ts
 */
export declare const ConfigurationFailure: import("@arki/failure").FailureDefinition<"embeddings.configuration", import("@standard-schema/spec").StandardSchemaV1<{
    message: string;
}, {
    message: string;
}>>;
export type RateLimited = ReturnType<typeof RateLimited>;
export type InputTooLong = ReturnType<typeof InputTooLong>;
export type ModelUnavailable = ReturnType<typeof ModelUnavailable>;
export type UnsupportedInput = ReturnType<typeof UnsupportedInput>;
export type InvalidOutput = ReturnType<typeof InvalidOutput>;
export type SpaceMismatch = ReturnType<typeof SpaceMismatch>;
export type Cancelled = ReturnType<typeof Cancelled>;
export type ConfigurationFailure = ReturnType<typeof ConfigurationFailure>;
declare const EMBED_FAILURES: readonly [import("@arki/failure").FailureDefinition<"embeddings.rate_limited", import("@standard-schema/spec").StandardSchemaV1<{
    retryAfterMs?: number | undefined;
}, {
    retryAfterMs?: number | undefined;
}>>, import("@arki/failure").FailureDefinition<"embeddings.input_too_long", import("@standard-schema/spec").StandardSchemaV1<{
    index: number;
    tokens: TokenCount;
    max: number;
}, {
    index: number;
    tokens: TokenCount;
    max: number;
}>>, import("@arki/failure").FailureDefinition<"embeddings.model_unavailable", import("@standard-schema/spec").StandardSchemaV1<{
    model: string;
    reason: "not-pulled" | "peer-missing" | "unknown-model" | "unreachable";
}, {
    model: string;
    reason: "not-pulled" | "peer-missing" | "unknown-model" | "unreachable";
}>>, import("@arki/failure").FailureDefinition<"embeddings.unsupported_input", import("@standard-schema/spec").StandardSchemaV1<{
    index: number;
    part: "batch" | "dimensions" | "image" | "quantization" | "text";
}, {
    index: number;
    part: "batch" | "dimensions" | "image" | "quantization" | "text";
}>>, import("@arki/failure").FailureDefinition<"embeddings.invalid_output", import("@standard-schema/spec").StandardSchemaV1<{
    reason: string;
}, {
    reason: string;
}>>, import("@arki/failure").FailureDefinition<"embeddings.space_mismatch", import("@standard-schema/spec").StandardSchemaV1<{
    expected: EmbeddingSpace;
    actual: EmbeddingSpace;
}, {
    expected: EmbeddingSpace;
    actual: EmbeddingSpace;
}>>, import("@arki/failure").FailureDefinition<"embeddings.cancelled", undefined>, import("@arki/failure").FailureDefinition<"embeddings.configuration", import("@standard-schema/spec").StandardSchemaV1<{
    message: string;
}, {
    message: string;
}>>, import("@arki/failure").FailureDefinition<"failure.unexpected_defect", undefined>];
export type EmbedFailure = ReturnType<(typeof EMBED_FAILURES)[number]>;
/**
 * True for a failure this package defines; false for every other value, other failures included.
 *
 * @example
 * if (isEmbedFailure(result)) log.warn(result.code);
 */
export declare function isEmbedFailure(value: unknown): value is EmbedFailure;
export {};
//# sourceMappingURL=failures.d.ts.map