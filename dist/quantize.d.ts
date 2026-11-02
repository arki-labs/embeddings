import type { Int8Calibration } from './types.js';
import { UnsupportedInput } from './failures.js';
/**
 * The per-dimension range of a sample of float vectors, for `quantize(v, 'int8', calibration)`.
 * Calibrate once on a sample of the corpus and keep the result with the index: every vector of
 * that index must be quantized with the same calibration.
 *
 * @example
 * const calibration = calibrateInt8(sample.vectors);
 */
export declare function calibrateInt8(sample: readonly Float32Array[]): Int8Calibration;
/**
 * A short, stable name for a calibration, stored in the space id: two int8 indexes are comparable
 * only when their calibrations are equal. sha256 over the little-endian float32 bytes of `min`
 * then `max`, first 16 hex characters.
 */
export declare function calibrationId(calibration: Int8Calibration): string;
/**
 * A float vector as int8 or packed bits.
 *
 * - `'binary'`: one bit per dimension, set when the value is above 0, **most significant bit
 *   first** (dimension 0 is bit 7 of byte 0). The size must be a multiple of 8.
 * - `'int8'`: each value mapped linearly from the calibration's `[min, max]` onto -128…127 and
 *   clamped. The calibration must have the vector's size.
 *
 * A size that does not fit is `UnsupportedInput { part: 'dimensions' }`.
 *
 * @example
 * const bits = quantize(vector, 'binary'); // Uint8Array of vector.length / 8 bytes
 * const bytes = quantize(vector, 'int8', calibration); // Int8Array of vector.length
 */
export declare function quantize(vector: Float32Array, to: 'binary'): Uint8Array | UnsupportedInput;
export declare function quantize(vector: Float32Array, to: 'int8', calibration: Int8Calibration): Int8Array | UnsupportedInput;
/**
 * Packed bits back to a float vector of ±1, for rescoring or a store that wants floats. The inverse
 * of `quantize(v, 'binary')` up to sign.
 *
 * @example
 * unpackBits(Uint8Array.of(0b1000_0000), 8); // Float32Array [1, -1, -1, -1, -1, -1, -1, -1]
 */
export declare function unpackBits(bits: Uint8Array, dimensions: number): Float32Array;
/**
 * How many bits differ between two packed binary vectors: lower is closer. The cheap first pass
 * before rescoring the best candidates with float vectors.
 *
 * @example
 * hamming(Uint8Array.of(0b1010_0000), Uint8Array.of(0b0010_0000)); // 1
 */
export declare function hamming(a: Uint8Array, b: Uint8Array): number;
//# sourceMappingURL=quantize.d.ts.map