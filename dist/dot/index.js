/**
 * `@arki/embeddings/dot`: the app's one embedder as a Dot unit. `@arki/dot` is an optional peer;
 * importing this entry without it fails at module load, on purpose.
 */
import { z } from 'zod';
import { infra } from '@arki/dot/unit';
import { isFailure } from '@arki/failure';
import { getLogger } from '@arki/log';
import { memoryCacheStore, withCache } from '../cache.js';
import { createEmbedder } from '../embedder.js';
import { isEmbedFailure } from '../failures.js';
import { withResilience } from '../resilience.js';
import { functionSchema, objectSchema, parseOptions, withOptionsJson } from '../schemas.js';
/** `EmbeddingsPluginOptions`, checked when `embeddings()` boots; a type test locks it to the type. */
export const embeddingsPluginOptionsSchema = withOptionsJson(z
    .object({
    model: z.union([
        objectSchema(),
        functionSchema(),
    ]),
    cache: z.union([z.boolean(), objectSchema()]).optional(),
    resilience: z.union([z.boolean(), objectSchema()]).optional(),
})
    .readonly());
function baseEmbedder(options) {
    const chosen = typeof options.model === 'function' ? options.model() : options.model;
    if (isEmbedFailure(chosen))
        return chosen;
    return 'embed' in chosen ? chosen : createEmbedder(chosen);
}
/** The base embedder with resilience inside and the cache outside, so a hit never waits on a retry. */
function build(input) {
    // A bad option is a configuration that does not build: the boot returns the failure (see `embeddings`).
    const options = parseOptions(embeddingsPluginOptionsSchema, input, 'embeddings plugin');
    if (isFailure(options))
        return options;
    const base = baseEmbedder(options);
    if (isEmbedFailure(base))
        return base;
    const { cache = false, resilience = false } = options;
    const resilient = resilience === false ? base : resilience === true ? withResilience(base) : withResilience(base, resilience);
    if (cache === false)
        return resilient;
    return withCache(resilient, cache === true ? memoryCacheStore() : cache);
}
/**
 * Publish `embedder`: the app's one `Embedder`, built once at boot. A configuration that does not
 * build (a bad option, a missing key, a size the model refuses) stops the boot: `boot()` returns
 * that failure, a `ConfigurationFailure` for configuration faults. An app never runs with embeddings
 * silently off. An app that can run without embeddings must not mount this unit.
 *
 * @example
 * const embedding = embeddings({
 *   model: () => createOllamaModel({ id: 'qwen3-embedding:0.6b', baseURL: process.env['OLLAMA_BASE_URL'] }),
 *   cache: true,
 * });
 * defineApp('reader').infra(embedding);
 * // in a feature: needs: { embedder: embedding.provides.embedder } → Embedder
 */
export function embeddings(options) {
    return infra({
        name: 'embeddings',
        provides: {
            embedder: () => {
                const built = build(options);
                if (isEmbedFailure(built)) {
                    getLogger('arki:embeddings').error('embeddings could not start: {code} {reason}', {
                        code: built.code,
                        reason: built.message,
                    });
                }
                return built;
            },
        },
    });
}
//# sourceMappingURL=index.js.map