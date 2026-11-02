/** Standard base64 of bytes. `btoa` runs on every runtime this package supports; chunks keep `fromCharCode` under the argument limit. */
export function toBase64(bytes) {
    let binary = '';
    for (let start = 0; start < bytes.length; start += 0x80_00) {
        binary += String.fromCodePoint(...bytes.subarray(start, start + 0x80_00));
    }
    return btoa(binary);
}
//# sourceMappingURL=base64.js.map