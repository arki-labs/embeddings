/**
 * Option fields the Transformers.js model and reranker share. The peer is optional, so its runtime
 * lists of dtypes and devices cannot be imported here: each is checked as a non-empty string and
 * Transformers.js refuses an unknown one when it loads.
 */
import type { ProgressCallback } from '@huggingface/transformers';
import { z } from 'zod';
export declare const dtypeSchema: z.ZodCustom<"auto" | "bnb4" | "fp16" | "fp32" | "int8" | "q1" | "q1f16" | "q2" | "q2f16" | "q4" | "q4f16" | "q8" | "uint8", "auto" | "bnb4" | "fp16" | "fp32" | "int8" | "q1" | "q1f16" | "q2" | "q2f16" | "q4" | "q4f16" | "q8" | "uint8">;
export declare const deviceSchema: z.ZodCustom<"auto" | "coreml" | "cpu" | "cuda" | "dml" | "gpu" | "wasm" | "webgpu" | "webnn" | "webnn-cpu" | "webnn-gpu" | "webnn-npu", "auto" | "coreml" | "cpu" | "cuda" | "dml" | "gpu" | "wasm" | "webgpu" | "webnn" | "webnn-cpu" | "webnn-gpu" | "webnn-npu">;
export declare const progressCallbackSchema: z.ZodCustom<ProgressCallback, ProgressCallback>;
//# sourceMappingURL=fields.d.ts.map