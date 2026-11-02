import type { EmbedFailure } from '../failures.js';
import type { EmbedInput, EmbedOptions, Embedder, EmbeddingModel } from '../types.js';
import type { Reranker } from '../rerank/index.js';
export { fromArkiEmbedder } from './from-arki-embedder.js';
export type FakeEmbedderOptions = {
    readonly dimensions: number;
    /** Different seeds give unrelated vectors for the same text. Default 0. */
    readonly seed?: number;
    /** An input whose exact text is a key fails the whole call with that failure. */
    readonly failures?: Readonly<Record<string, EmbedFailure>>;
    /** Waits this long per call, so concurrency and cancellation are observable. */
    readonly delayMs?: number;
};
/**
 * A seeded, deterministic, not-semantic embedder. Its vectors go through the same validation as a real one.
 *
 * @example
 * const embedder = fakeEmbedder({ dimensions: 8, failures: { 'bad text': RateLimited({}) } });
 */
export declare function fakeEmbedder(options: FakeEmbedderOptions): Embedder;
/**
 * The same embedder, writing every successful text-only call to `path` as JSON: one array of
 * `{ key, request, limits, vectors, space, tokens }`, rewritten after each call. A recording run
 * starts a fresh file. Node, Bun and Deno only (it writes with `node:fs`); replay runs anywhere.
 *
 * @example
 * const recorder = recordEmbedder(createEmbedder(model), '__fixtures__/qwen3.json');
 * await embedMany(recorder, corpus); // run once against the real model, commit the file
 */
export declare function recordEmbedder(embedder: Embedder, path: string): Embedder;
/**
 * An embedder that answers only from recordings made by `recordEmbedder` (the parsed file). A
 * request that was not recorded is `InvalidOutput { reason: 'no fixture …' }`, never a made-up
 * vector. A file that does not parse, is empty, or mixes spaces is `ConfigurationFailure`.
 *
 * @example
 * const embedder = fixtureEmbedder(JSON.parse(readFileSync('__fixtures__/qwen3.json', 'utf8')));
 */
export declare function fixtureEmbedder(recordings: unknown): import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}> | {
    model: EmbeddingModel;
    space: Readonly<{
        provider: "bedrock" | "cohere" | "fake" | "google" | "jina" | "mistral" | "ollama" | "openai" | "openai-compatible" | "tei" | "transformers" | "voyage";
        model: string;
        revision?: string | undefined;
        dimensions: number;
        normalized: boolean;
        quantization: "binary" | "float32" | "int8";
        calibration?: string | undefined;
        instructionVersion: number;
    }>;
    spaceFor: (options: Pick<EmbedOptions, "dimensions" | "quantization">) => Readonly<{
        provider: "bedrock" | "cohere" | "fake" | "google" | "jina" | "mistral" | "ollama" | "openai" | "openai-compatible" | "tei" | "transformers" | "voyage";
        model: string;
        revision?: string | undefined;
        dimensions: number;
        normalized: boolean;
        quantization: "binary" | "float32" | "int8";
        calibration?: string | undefined;
        instructionVersion: number;
    }>;
    embed: (inputs: readonly EmbedInput[], options: EmbedOptions) => Promise<import("@arki/failure").Failure<"embeddings.cancelled", undefined>> | Promise<import("@arki/failure").Failure<"embeddings.invalid_output", {
        reason: string;
    }>> | Promise<{
        vectors: (Float32Array<ArrayBufferLike> | Int8Array<ArrayBufferLike> | Uint8Array<ArrayBufferLike>)[];
        space: Readonly<{
            provider: "bedrock" | "cohere" | "fake" | "google" | "jina" | "mistral" | "ollama" | "openai" | "openai-compatible" | "tei" | "transformers" | "voyage";
            model: string;
            revision?: string | undefined;
            dimensions: number;
            normalized: boolean;
            quantization: "binary" | "float32" | "int8";
            calibration?: string | undefined;
            instructionVersion: number;
        }>;
        usage: {
            tokens: Readonly<{
                basis: "counted" | "estimated" | "reported";
                count: number;
            }> | Readonly<{
                basis: "unknown";
            }>;
            requests: number;
            cacheHits: number;
        };
    }>;
};
export type FakeRerankerOptions = {
    /** A fixed score per exact document text. Any other document gets a seeded score in [0, 1). */
    readonly scores?: Readonly<Record<string, number>>;
    /** Different seeds give unrelated scores for the same pair. Default 0. */
    readonly seed?: number;
    /** Default 1000. */
    readonly maxDocuments?: number;
    /** Default 512, counted as `rerank()` estimates without a tokenizer: characters / 4. */
    readonly maxInputTokens?: number;
};
/**
 * A seeded, deterministic, not-semantic reranker. Like a real one it refuses more than
 * `maxDocuments` documents and, unless told to truncate, a query and document over `maxInputTokens`.
 *
 * @example
 * const reranker = fakeReranker({ scores: { 'the answer': 0.9 }, maxDocuments: 2 });
 */
export declare function fakeReranker(options?: FakeRerankerOptions): Reranker;
//# sourceMappingURL=index.d.ts.map