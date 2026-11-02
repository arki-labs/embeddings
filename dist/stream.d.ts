import type { EmbedFailure } from './failures.js';
import type { Embedder, Embedding, EmbedInput, EmbedOptions } from './types.js';
/** `embedStream` options: the per-call options, the text of each item, and how far ahead it may run. */
export type EmbedStreamOptions<Item> = EmbedOptions & {
    /** The input to embed for one item, e.g. `doc => doc.body`. */
    readonly text: (item: Item) => EmbedInput;
    /** Requests in flight at once. Default 2. */
    readonly concurrency?: number;
    /** Items read from the source and not yet delivered, at most. Default 64. */
    readonly maxPending?: number;
};
/**
 * `EmbedStreamOptions`, checked by `embedStream`; a type test locks it to the type at `Item = unknown`
 * (a function field is checked as a function, so the item type is not part of the schema).
 */
export declare const embedStreamOptionsSchema: import("@arki/schema").SchemaWithJson<Readonly<{
    purpose?: "classification" | "clustering" | "document" | "query" | "similarity" | undefined;
    dimensions?: number | undefined;
    quantization?: "binary" | "int8" | undefined;
    onTooLong?: "fail" | "truncate" | undefined;
    signal?: AbortSignal | undefined;
    text: (item: unknown) => EmbedInput;
    concurrency?: number | undefined;
    maxPending?: number | undefined;
}>, Readonly<{
    purpose?: "classification" | "clustering" | "document" | "query" | "similarity" | undefined;
    dimensions?: number | undefined;
    quantization?: "binary" | "int8" | undefined;
    onTooLong?: "fail" | "truncate" | undefined;
    signal?: AbortSignal | undefined;
    text: (item: unknown) => EmbedInput;
    concurrency?: number | undefined;
    maxPending?: number | undefined;
}>>;
/**
 * Embeds a source of any length as a `ReadableStream` of `{ item, result }` in source order. Pull
 * based: the source is read only while the reader is reading and fewer than `maxPending` items are
 * in flight, so memory stays flat over a corpus. A failed request does not end the stream: each of
 * its items gets the failure as its `result`. The first item of a request carries that request's
 * `usage`; the others carry zero, so summing every item's usage gives the total. Cancelling the
 * stream (or aborting `signal`) aborts the requests in flight and reads no more from the source.
 * A throw from the source, `text` or a custom `embed` is a bug and errors the stream.
 *
 * @example
 * const results = embedStream(embedder, documents, { text: doc => doc.body, purpose: 'document' });
 * for await (const { item, result } of results) {
 *   if (isEmbedFailure(result)) log.warn('skipped {id}: {code}', { id: item.id, code: result.code });
 *   else await store.upsert(item.id, result.vector);
 * }
 */
export declare function embedStream<Item>(embedder: Embedder, source: Iterable<Item> | AsyncIterable<Item>, options: EmbedStreamOptions<Item>): ReadableStream<{
    readonly item: Item;
    readonly result: Embedding | EmbedFailure;
}>;
//# sourceMappingURL=stream.d.ts.map