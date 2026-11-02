import { z } from 'zod';
import { isFailure } from '@arki/failure';
import { assert } from '@arki/schema';
import { embedChunks } from './embed.js';
import { InputTooLong, InvalidOutput } from './failures.js';
import { embedOptionsFields, functionSchema, withOptionsJson } from './schemas.js';
/**
 * `EmbedStreamOptions`, checked by `embedStream`; a type test locks it to the type at `Item = unknown`
 * (a function field is checked as a function, so the item type is not part of the schema).
 */
export const embedStreamOptionsSchema = withOptionsJson(embedOptionsFields
    .extend({
    text: functionSchema(),
    concurrency: z.number().int().positive().optional(),
    maxPending: z.number().int().positive().optional(),
})
    .readonly());
/** Usage of an item that shares a request with an earlier item: that item already carries the cost. */
function nothing(tokens) {
    return {
        tokens: tokens.basis === 'unknown' ? tokens : { basis: tokens.basis, count: 0 },
        requests: 0,
        cacheHits: 0,
    };
}
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
export function embedStream(embedder, source, options) {
    assert(options, embedStreamOptionsSchema, { at: 'embedStream options' });
    const { text, concurrency: lanes = 2, maxPending: room = 64, signal, ...embedOptions } = options;
    const width = Math.min(embedder.model.maxBatch, room);
    const controller = new AbortController();
    const stop = () => controller.abort();
    signal?.addEventListener('abort', stop, { once: true });
    if (signal?.aborted)
        controller.abort();
    let iterator;
    const windows = [];
    let exhausted = false;
    let pending = 0;
    let read = 0;
    /** Reads up to one request's worth of items, never past `maxPending`. */
    const gather = async () => {
        iterator ??= Symbol.asyncIterator in source ? source[Symbol.asyncIterator]() : source[Symbol.iterator]();
        const items = [];
        while (items.length < Math.min(width, room - pending) && !controller.signal.aborted) {
            const step = await iterator.next();
            if (step.done === true) {
                exhausted = true;
                break;
            }
            items.push(step.value);
        }
        return items;
    };
    /** Starts requests until `concurrency` are in flight, `maxPending` items are out, or the source ends. */
    const fill = async () => {
        while (windows.length < lanes && pending < room && !exhausted && !controller.signal.aborted) {
            const items = await gather();
            if (items.length === 0)
                return;
            const result = embedChunks(embedder, items.map(item => text(item)), { ...embedOptions, concurrency: 1, signal: controller.signal }).then(batch => ({ batch }), (error) => ({ thrown: error }));
            windows.push({ items, start: read, result });
            read += items.length;
            pending += items.length;
        }
    };
    const close = async () => {
        signal?.removeEventListener('abort', stop);
        if (!exhausted)
            await iterator?.return?.();
    };
    return new ReadableStream({
        async pull(stream) {
            try {
                await fill();
                const head = windows.shift();
                if (head === undefined) {
                    await close();
                    stream.close();
                    return;
                }
                const settled = await head.result;
                if ('thrown' in settled)
                    throw settled.thrown;
                const { batch } = settled;
                pending -= head.items.length;
                for (const [offset, item] of head.items.entries()) {
                    if (isFailure(batch)) {
                        // An index from `embedMany` counts within this request; the reader's counts within the source.
                        const result = InputTooLong.is(batch)
                            ? InputTooLong({ ...batch.data, index: batch.data.index + head.start })
                            : batch;
                        stream.enqueue({ item, result });
                        continue;
                    }
                    const vector = batch.vectors[offset];
                    const usage = offset === 0 ? batch.usage : nothing(batch.usage.tokens);
                    stream.enqueue({
                        item,
                        result: vector === undefined
                            ? InvalidOutput({ reason: `count: expected ${head.items.length} vectors, got ${batch.vectors.length}` })
                            : { vector, space: batch.space, usage },
                    });
                }
            }
            catch (error) {
                // A throw from the source, `text` or the model must not leave requests running or the source open.
                controller.abort();
                await close();
                throw error;
            }
        },
        async cancel() {
            controller.abort();
            await close();
        },
    });
}
//# sourceMappingURL=stream.js.map