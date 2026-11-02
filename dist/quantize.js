import { invariant } from '@arki/failure';
import { UnsupportedInput } from './failures.js';
import { sha256Hex } from './sha256.js';
/**
 * The per-dimension range of a sample of float vectors, for `quantize(v, 'int8', calibration)`.
 * Calibrate once on a sample of the corpus and keep the result with the index: every vector of
 * that index must be quantized with the same calibration.
 *
 * @example
 * const calibration = calibrateInt8(sample.vectors);
 */
export function calibrateInt8(sample) {
    const first = sample[0];
    invariant(first !== undefined, 'calibrateInt8 needs at least one vector');
    const min = Float32Array.from(first);
    const max = Float32Array.from(first);
    for (const vector of sample) {
        invariant(vector.length === min.length, () => `calibrateInt8: vectors of ${min.length} and ${vector.length} dims`);
        for (const [index, value] of vector.entries()) {
            if (value < (min[index] ?? 0))
                min[index] = value;
            if (value > (max[index] ?? 0))
                max[index] = value;
        }
    }
    return { min, max };
}
/**
 * A short, stable name for a calibration, stored in the space id: two int8 indexes are comparable
 * only when their calibrations are equal. sha256 over the little-endian float32 bytes of `min`
 * then `max`, first 16 hex characters.
 */
export function calibrationId(calibration) {
    const length = calibration.min.length;
    invariant(calibration.max.length === length, () => `calibration: ${length} minimums and ${calibration.max.length} maximums`);
    const bytes = new DataView(new ArrayBuffer(length * 8));
    for (let index = 0; index < length; index++) {
        bytes.setFloat32(index * 4, calibration.min[index] ?? 0, true);
        bytes.setFloat32((length + index) * 4, calibration.max[index] ?? 0, true);
    }
    return sha256Hex(new Uint8Array(bytes.buffer)).slice(0, 16);
}
export function quantize(vector, to, calibration) {
    if (to === 'binary') {
        if (vector.length % 8 !== 0)
            return UnsupportedInput({ index: -1, part: 'dimensions' });
        const out = new Uint8Array(vector.length / 8);
        for (const [index, element] of vector.entries()) {
            if (element > 0)
                out[index >> 3] = (out[index >> 3] ?? 0) | (0x80 >> (index & 7));
        }
        return out;
    }
    if (calibration === undefined || calibration.min.length !== vector.length) {
        return UnsupportedInput({ index: -1, part: 'dimensions' });
    }
    invariant(calibration.max.length === calibration.min.length, 'calibration: min and max differ in length');
    const out = new Int8Array(vector.length);
    for (const [index, element] of vector.entries()) {
        const min = calibration.min[index] ?? 0;
        const range = (calibration.max[index] ?? 0) - min;
        // A dimension that never varied in the sample carries no signal: 0 adds nothing to a dot product.
        if (range === 0)
            continue;
        const scaled = Math.round((element - min) * (255 / range)) - 128;
        out[index] = Math.max(-128, Math.min(127, scaled));
    }
    return out;
}
/**
 * Packed bits back to a float vector of ±1, for rescoring or a store that wants floats. The inverse
 * of `quantize(v, 'binary')` up to sign.
 *
 * @example
 * unpackBits(Uint8Array.of(0b1000_0000), 8); // Float32Array [1, -1, -1, -1, -1, -1, -1, -1]
 */
export function unpackBits(bits, dimensions) {
    invariant(dimensions <= bits.length * 8, () => `unpackBits: ${bits.length} bytes hold fewer than ${dimensions} dims`);
    const out = new Float32Array(dimensions);
    for (let index = 0; index < dimensions; index++) {
        out[index] = ((bits[index >> 3] ?? 0) & (0x80 >> (index & 7))) === 0 ? -1 : 1;
    }
    return out;
}
/** Set bits per byte value, so `hamming` does one lookup per byte. */
const POPCOUNT = Uint8Array.from({ length: 256 }, (_, byte) => {
    let count = 0;
    for (let rest = byte; rest !== 0; rest >>= 1)
        count += rest & 1;
    return count;
});
/**
 * How many bits differ between two packed binary vectors: lower is closer. The cheap first pass
 * before rescoring the best candidates with float vectors.
 *
 * @example
 * hamming(Uint8Array.of(0b1010_0000), Uint8Array.of(0b0010_0000)); // 1
 */
export function hamming(a, b) {
    invariant(a.length === b.length, () => `hamming: ${a.length} and ${b.length} bytes`);
    let distance = 0;
    for (let index = 0; index < a.length; index++)
        distance += POPCOUNT[(a[index] ?? 0) ^ (b[index] ?? 0)] ?? 0;
    return distance;
}
//# sourceMappingURL=quantize.js.map