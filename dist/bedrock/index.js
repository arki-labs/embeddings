/**
 * `@arki/embeddings/bedrock`: Amazon Titan Text Embeddings on AWS Bedrock through the AI SDK.
 * Server runtimes only (Node, Bun): the AWS request signing needs `node:crypto`.
 *
 * The SDK peers (`@ai-sdk/amazon-bedrock`, `ai`) are loaded with a dynamic `import()` on the first
 * call, not at import, exactly like `./google`. A missing peer is the value
 * `ModelUnavailable { reason: 'peer-missing' }`, returned by that first call.
 */
import { z } from 'zod';
import { isFailure } from '@arki/failure';
import { Cancelled, ConfigurationFailure, InputTooLong, InvalidOutput, ModelUnavailable, RateLimited } from '../failures.js';
import { functionSchema, parseOptions, withOptionsJson } from '../schemas.js';
import { retryAfterMs, requestSignal } from '../http.js';
import { NO_INSTRUCTION } from '../instructions.js';
import { countTokens, truncateByEstimate } from '../tokens.js';
// Titan's wording for an over-long text ("Too many input tokens"). Not in the AWS docs; seen in Bedrock error reports.
const TOO_LONG = /too many input tokens/i;
/** `InputTooLong` naming the input with the most tokens by `countTokens`: the likeliest culprit, with that count. */
function inputTooLong(model, texts) {
    let index = 0;
    let tokens = { basis: 'unknown' };
    for (const [position, text] of texts.entries()) {
        const counted = countTokens(model, text);
        if (counted.basis === 'unknown' || (tokens.basis !== 'unknown' && counted.count <= tokens.count))
            continue;
        index = position;
        tokens = counted;
    }
    return InputTooLong({ index, tokens, max: model.maxInputTokens });
}
/** `BedrockModelOptions`, checked by `createBedrockModel`; a type test locks it to the type. */
export const bedrockModelOptionsSchema = withOptionsJson(z
    .object({
    id: z.string().min(1).optional(),
    region: z.string().min(1).optional(),
    apiKey: z.string().min(1).optional(),
    accessKeyId: z.string().min(1).optional(),
    secretAccessKey: z.string().min(1).optional(),
    sessionToken: z.string().min(1).optional(),
    baseURL: z.url({ protocol: /^https?$/ }).optional(),
    fetch: functionSchema().optional(),
})
    .readonly());
/** The sizes Titan V2 accepts, native first. */
const TITAN_SIZES = [1024, 512, 256];
// https://docs.aws.amazon.com/bedrock/latest/userguide/titan-embedding-models.html (read 2026-10-22):
// Titan Text Embeddings V2 takes up to 8,192 tokens or 50,000 characters and outputs 1,024 (default),
// 512 or 256 dims. The request has `normalize` (default true) and `dimensions`.
const BEDROCK_FACTS = {
    'amazon.titan-embed-text-v2:0': { dimensions: 1024, matryoshka: TITAN_SIZES, maxInputTokens: 8192 },
};
/** Loads both peers and builds the SDK model once. Any import failure means the peer is not installed. */
async function loadSdk(id, options) {
    try {
        const [{ createAmazonBedrock }, { embedMany, APICallError }] = await Promise.all([
            import('@ai-sdk/amazon-bedrock'),
            import('ai'),
        ]);
        const send = options.fetch;
        const provider = createAmazonBedrock({
            ...(options.region === undefined ? {} : { region: options.region }),
            ...(options.apiKey === undefined ? {} : { apiKey: options.apiKey }),
            ...(options.accessKeyId === undefined ? {} : { accessKeyId: options.accessKeyId }),
            ...(options.secretAccessKey === undefined ? {} : { secretAccessKey: options.secretAccessKey }),
            ...(options.sessionToken === undefined ? {} : { sessionToken: options.sessionToken }),
            ...(options.baseURL === undefined ? {} : { baseURL: options.baseURL }),
            // The SDK may hand over a URL or a Request; the narrow stub type wants a string and an init.
            ...(send === undefined
                ? {}
                : {
                    fetch: (input, init) => {
                        if (typeof input === 'string')
                            return send(input, init ?? {});
                        if (input instanceof URL)
                            return send(input.href, init ?? {});
                        return send(input.url, { method: input.method, headers: input.headers, body: input.body, ...init });
                    },
                }),
        });
        return { model: provider.embeddingModel(id), embedMany, apiCallError: APICallError };
    }
    catch {
        return ModelUnavailable({ model: id, reason: 'peer-missing' });
    }
}
/**
 * A Bedrock Titan model record. Titan ids are versioned (`:0`), so `assurance` is `immutable`.
 *
 * @example
 * const model = createBedrockModel({ region: 'us-east-1' });
 */
export function createBedrockModel(input = {}) {
    const options = parseOptions(bedrockModelOptionsSchema, input, 'bedrock');
    if (isFailure(options))
        return options;
    const id = options.id ?? 'amazon.titan-embed-text-v2:0';
    const facts = BEDROCK_FACTS[id];
    if (facts === undefined) {
        return ConfigurationFailure({
            message: `bedrock model ${id} is not in the facts table (${Object.keys(BEDROCK_FACTS).join(', ')})`,
        });
    }
    let sdk;
    const embedTexts = async ({ texts, dimensions, truncate, signal }) => {
        sdk ??= loadSdk(id, options);
        const loaded = await sdk;
        if (isFailure(loaded)) {
            sdk = undefined;
            return loaded;
        }
        // The SDK's option takes the literal sizes only; `find` hands back the matching literal.
        const size = TITAN_SIZES.find(candidate => candidate === dimensions);
        try {
            const result = await loaded.embedMany({
                model: loaded.model,
                // Titan has no truncate flag: cut at the character estimate of the model's limit.
                values: truncate ? texts.map(text => truncateByEstimate(text, facts.maxInputTokens)) : [...texts],
                // Retries belong to withResilience, where each attempt is charged once.
                maxRetries: 0,
                providerOptions: { bedrock: { normalize: true, ...(size === undefined ? {} : { dimensions: size }) } },
                abortSignal: requestSignal(signal),
            });
            const tokens = result.usage.tokens;
            return {
                vectors: result.embeddings,
                tokens: Number.isFinite(tokens) ? { basis: 'reported', count: tokens } : { basis: 'unknown' },
            };
        }
        catch (error) {
            if (signal?.aborted)
                return Cancelled();
            if (!loaded.apiCallError.isInstance(error)) {
                // The SDK throws a plain Error before any request when it finds no credentials: not an outage.
                if (error instanceof Error && /AWS SigV4 authentication requires/.test(error.message)) {
                    return ConfigurationFailure({ message: `bedrock has no credentials: ${error.message.slice(0, 200)}` });
                }
                return ModelUnavailable({ model: id, reason: 'unreachable' });
            }
            const status = error.statusCode;
            if (status === undefined)
                return ModelUnavailable({ model: id, reason: 'unreachable' });
            if (status === 429) {
                const wait = retryAfterMs(name => error.responseHeaders?.[name]);
                return RateLimited(wait === undefined ? {} : { retryAfterMs: wait });
            }
            // Bedrock answers 403 for bad credentials and for a model the account has not enabled.
            if (status === 401 || status === 403) {
                return ConfigurationFailure({
                    message: `bedrock refused the credentials (${status}): ${error.message.slice(0, 200)}`,
                });
            }
            if (status === 404)
                return ModelUnavailable({ model: id, reason: 'unknown-model' });
            if (status === 400 && TOO_LONG.test(`${error.message} ${error.responseBody ?? ''}`)) {
                return inputTooLong(model, texts);
            }
            // A server fault is worth another try: it is the same unreachable failure a dropped connection is.
            if (status >= 500)
                return ModelUnavailable({ model: id, reason: 'unreachable' });
            return InvalidOutput({ reason: `bedrock answered ${status}: ${error.message.slice(0, 200)}` });
        }
    };
    const model = {
        provider: 'bedrock',
        id,
        assurance: 'immutable',
        local: false,
        ...facts,
        // One text per Titan call: the SDK splits a batch into parallel calls, so keep batches small for the RPM quota.
        maxBatch: 16,
        maxBatchTokens: 16 * facts.maxInputTokens,
        normalized: true,
        instruction: NO_INSTRUCTION,
        inputs: ['text'],
        // Titan's `embeddingTypes: ['binary']` is not reachable through the AI SDK.
        quantizations: [],
        embedTexts,
    };
    return model;
}
//# sourceMappingURL=index.js.map