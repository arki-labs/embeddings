/**
 * SHA-256 in plain TypeScript (FIPS 180-4), as lowercase hex. The cache key needs one hash that is
 * the same on every runtime the package claims: Web Crypto's `subtle` is missing on Hermes and in
 * an insecure browser context, and it is async. Not exported: it is not a crypto library.
 */
/** The hex SHA-256 of `bytes`. */
export declare function sha256Hex(bytes: Uint8Array): string;
//# sourceMappingURL=sha256.d.ts.map