/** Options of {@link normalizeText}. */
export type NormalizeTextOptions = {
    /**
     * Replace the legacy cedilla letters with Romanian's comma-below ones: ş→ș, ţ→ț, Ş→Ș, Ţ→Ț. Text
     * typed on old keyboards mixes both, and a model sees them as different characters.
     */
    readonly romanianDiacritics?: boolean;
};
/** `NormalizeTextOptions`, checked by `normalizeText`; a type test locks it to the type. */
export declare const normalizeTextOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    romanianDiacritics?: boolean | undefined;
}>, Readonly<{
    romanianDiacritics?: boolean | undefined;
}>>;
/**
 * Puts text in one form before you embed or store it: Unicode NFC, every run of whitespace as one
 * space, no space at either end, and, when asked, Romanian comma-below letters. The embedder never
 * calls it: it sends your text exactly as given, so call this yourself, on documents and queries alike.
 *
 * @example
 * normalizeText('  Ştefan   şi\nţara ', { romanianDiacritics: true }); // 'Ștefan și țara'
 */
export declare function normalizeText(text: string, options?: NormalizeTextOptions): string;
//# sourceMappingURL=normalize.d.ts.map