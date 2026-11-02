import type { Embedder, EmbeddingModel, EmbeddingsLogger, Int8Calibration, Quantization } from './types.js';
/** Output options an embedder is created with. */
export type EmbedderOptions = {
    readonly dimensions?: number;
    /**
     * Asked of the provider when it makes this dtype natively, else made here from validated floats:
     * `'binary'` always (size a multiple of 8), `'int8'` only with a `calibration`.
     */
    readonly quantization?: 'int8' | 'binary';
    /** The corpus's shared int8 range (`calibrateInt8`). With it, int8 is always made here and the space names it. */
    readonly calibration?: Int8Calibration;
    readonly log?: EmbeddingsLogger;
};
/** `EmbedderOptions`, checked by `createEmbedder`; a type test locks it to the type. */
export declare const embedderOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    dimensions?: number | undefined;
    quantization?: "binary" | "int8" | undefined;
    calibration?: Readonly<{
        min: Float32Array<ArrayBufferLike>;
        max: Float32Array<ArrayBufferLike>;
    }> | undefined;
    log?: import("@arki/log").Logger | undefined;
}>, Readonly<{
    dimensions?: number | undefined;
    quantization?: "binary" | "int8" | undefined;
    calibration?: Readonly<{
        min: Float32Array<ArrayBufferLike>;
        max: Float32Array<ArrayBufferLike>;
    }> | undefined;
    log?: import("@arki/log").Logger | undefined;
}>>;
/**
 * A model with fixed output options. Refuses sizes outside `model.matryoshka` and dtypes the
 * provider cannot produce with `UnsupportedInput`, never a throw.
 *
 * @example
 * const embedder = createEmbedder(model, { dimensions: 512 }); // an Embedder, UnsupportedInput or ConfigurationFailure
 */
export declare function createEmbedder(model: EmbeddingModel, input?: EmbedderOptions): Embedder | import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}> | import("@arki/failure").Failure<"embeddings.unsupported_input", {
    index: number;
    part: "batch" | "dimensions" | "image" | "quantization" | "text";
}>;
/** `createEmbedder` after its checks. `./testing` uses it directly: the fake's options are always valid. */
export declare function buildEmbedder(model: EmbeddingModel, dimensions: number, quantization: Quantization, log: EmbeddingsLogger, calibration?: Int8Calibration): Embedder;
//# sourceMappingURL=embedder.d.ts.map