import type { DataType, DeviceType, ProgressCallback } from '@huggingface/transformers';
import type { SchemaWithJson } from '@arki/schema';
import type { Reranker } from '../rerank/index.js';
import { InvalidOutput, ModelUnavailable } from '../failures.js';
export type TransformersRerankerOptions = {
    /** Hugging Face model id. Default `'onnx-community/bge-reranker-v2-m3-ONNX'`. */
    readonly id?: string;
    /** Commit, branch or tag. Default: the pinned commit for an id listed below, `'main'` for any other id. */
    readonly revision?: string;
    /** ONNX weights to load. Default `'q8'` (570 MB for bge-reranker-v2-m3, 1.2 GB for Qwen3-Reranker-0.6B). */
    readonly dtype?: DataType;
    /** `'cpu'` (Node, Bun), `'webgpu'` or `'wasm'` (browser). Default: Transformers.js picks. */
    readonly device?: DeviceType;
    /** Where downloaded weights are kept. Default: Transformers.js' own cache. */
    readonly cacheDir?: string;
    readonly onProgress?: ProgressCallback;
    /**
     * Tokens one pair may take, prompt and special tokens included. Default 1024: a pair costs time
     * with the square of its length, and longer documents can be split by `rerank()`.
     */
    readonly maxInputTokens?: number;
    /** Qwen3-Reranker only: the task line. Default: its card's web-search instruction. */
    readonly instruction?: string;
};
/** `TransformersRerankerOptions`, checked by `createTransformersReranker`; a type test locks it to the type. */
export declare const transformersRerankerOptionsSchema: SchemaWithJson<TransformersRerankerOptions, TransformersRerankerOptions>;
/**
 * Loads a reranker in process and scores one probe pair, so a model that is not the kind expected
 * fails here and not on the first query. `countTokens` is exact (the loaded tokenizer). Each call
 * loads its own session; `dispose()` frees it. Qwen3-Reranker scores one document per model run:
 * its output holds a logit per vocabulary entry (151k) at every position.
 *
 * `q8` weights quantize activations per batch, so a score moves by up to 0.002 with the other
 * documents in its batch (measured on bge-reranker-v2-m3; `fp16` holds it to 3e-6). Rankings are
 * not affected in practice; an exact repeat needs the same batches or `fp16`.
 *
 * @example
 * const reranker = await createTransformersReranker({ cacheDir: '.cache/models' });
 * if (isFailure(reranker)) return reranker; // ModelUnavailable: peer-missing, unknown-model or unreachable
 * const ranked = await rerank(reranker, 'cum se calculează TVA?', hits, { text: hit => hit.text, topK: 10 });
 * @fix `peer-missing`: `bun add @huggingface/transformers`. `unreachable`: check the network or `cacheDir`.
 */
export declare function createTransformersReranker(options?: TransformersRerankerOptions): Promise<Reranker | ReturnType<typeof ModelUnavailable> | ReturnType<typeof InvalidOutput>>;
//# sourceMappingURL=rerank.d.ts.map