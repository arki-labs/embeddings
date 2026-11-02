import type { DataType, DeviceType, ProgressCallback } from '@huggingface/transformers';
import { UnexpectedDefect } from '@arki/failure';
import type { SchemaWithJson } from '@arki/schema';
import type { EmbeddingModel, Instruction } from '../types.js';
import { Cancelled, InvalidOutput, ModelUnavailable } from '../failures.js';
export type TransformersModelOptions = {
    /** Hugging Face model id. Default `'onnx-community/embeddinggemma-300m-ONNX'`. */
    readonly id?: string;
    /**
     * Commit, branch or tag. Default: the pinned commit for an id listed below, `'main'` for any other id.
     * A 40-hex commit makes the model `immutable`; anything else is `mutable`.
     */
    readonly revision?: string;
    /** ONNX weights to load. Default `'q8'`. EmbeddingGemma does not support `fp16`. */
    readonly dtype?: DataType;
    /** `'cpu'` (Node, Bun), `'webgpu'` or `'wasm'` (browser). Default: Transformers.js picks. */
    readonly device?: DeviceType;
    /** Where downloaded weights are kept. Default: Transformers.js' own cache. */
    readonly cacheDir?: string;
    /** Download and load progress, straight from Transformers.js. */
    readonly onProgress?: ProgressCallback;
    /** Overrides the prefixes; required to get them for an id other than EmbeddingGemma. */
    readonly instruction?: Instruction;
};
/** `TransformersModelOptions`, checked by `createTransformersModel`; a type test locks it to the type. */
export declare const transformersModelOptionsSchema: SchemaWithJson<TransformersModelOptions, TransformersModelOptions>;
type LoadFailure = ReturnType<typeof ModelUnavailable> | RunFailure;
/** Why a batch gave no vectors: a malformed answer, a cancel, or the runtime itself failing. */
type RunFailure = ReturnType<typeof InvalidOutput> | ReturnType<typeof Cancelled> | ReturnType<typeof UnexpectedDefect>;
/**
 * Loads a model in process and embeds one probe text, so `dimensions` is what the weights produce.
 * Concurrent calls with the same id, revision, dtype, device and cache dir share one load; the
 * session is freed when every record from it has called `dispose()`. `countTokens` is exact (the
 * loaded tokenizer). The first load downloads the weights (about 316 MB for EmbeddingGemma `q8`).
 *
 * @example
 * const model = await createTransformersModel({ cacheDir: '.cache/models' });
 * if (isEmbedFailure(model)) return model; // ModelUnavailable: peer-missing, unknown-model or unreachable
 * const embedder = createEmbedder(model);
 * @fix `peer-missing`: `bun add @huggingface/transformers`. `unreachable`: check the network or `cacheDir`.
 */
export declare function createTransformersModel(input?: TransformersModelOptions): Promise<EmbeddingModel | import("@arki/failure").Failure<"embeddings.configuration", {
    message: string;
}> | LoadFailure>;
export { createTransformersReranker, transformersRerankerOptionsSchema } from './rerank.js';
export type { TransformersRerankerOptions } from './rerank.js';
//# sourceMappingURL=index.d.ts.map