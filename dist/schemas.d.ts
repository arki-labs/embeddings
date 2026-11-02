/**
 * Schemas for this package's types where they are read back from JSON (recorded fixtures), and the
 * helpers every options schema uses. Not an entry: each schema is locked to its type by an exact
 * two-way type test in `schemas.test.ts`.
 */
import { z } from 'zod';
import type { StandardSchemaV1 } from '@arki/schema';
import { ConfigurationFailure } from './failures.js';
/**
 * An options schema that also answers its JSON Schema. Zod cannot write a function or an object
 * with methods as JSON Schema, so such a field shows as `{}` (any value); the parse still checks it.
 */
export declare function withOptionsJson<Schema extends z.ZodType>(schema: Schema): import("@arki/schema").SchemaWithJson<z.core.input<Schema>, z.infer<Schema>>;
/** A field that must be a function; the type argument names which one. */
export declare function functionSchema<Fn>(): z.ZodCustom<Fn, Fn>;
/** A field that must be an object (a store, a tokenizer, an `AbortSignal`, a logger); its methods are not checked. */
export declare function objectSchema<Value extends object>(): z.ZodCustom<Value, Value>;
/**
 * A factory's options after its schema, or the `ConfigurationFailure` naming each bad field.
 * Factories return failures for bad setup (an empty key from the environment is expected).
 */
export declare function parseOptions<Output>(schema: StandardSchemaV1<unknown, Output>, options: unknown, label: string): Output | ConfigurationFailure;
/** `Instruction`, the prefixes a provider's options may override; a type test locks it to the type. */
export declare const instructionSchema: z.ZodIntersection<z.ZodReadonly<z.ZodRecord<z.ZodEnum<{
    classification: "classification";
    clustering: "clustering";
    document: "document";
    query: "query";
    similarity: "similarity";
}> & z.core.$partial, z.ZodString>>, z.ZodReadonly<z.ZodObject<{
    version: z.ZodNumber;
}, z.core.$strip>>>;
/** `EmbeddingSpace` as it reads back from JSON; a type test locks it to the type. */
export declare const spaceSchema: z.ZodReadonly<z.ZodObject<{
    provider: z.ZodEnum<{
        bedrock: "bedrock";
        cohere: "cohere";
        fake: "fake";
        google: "google";
        jina: "jina";
        mistral: "mistral";
        ollama: "ollama";
        openai: "openai";
        "openai-compatible": "openai-compatible";
        tei: "tei";
        transformers: "transformers";
        voyage: "voyage";
    }>;
    model: z.ZodString;
    revision: z.ZodOptional<z.ZodString>;
    dimensions: z.ZodNumber;
    normalized: z.ZodBoolean;
    quantization: z.ZodEnum<{
        binary: "binary";
        float32: "float32";
        int8: "int8";
    }>;
    calibration: z.ZodOptional<z.ZodString>;
    instructionVersion: z.ZodNumber;
}, z.core.$strip>>;
/** `TokenCount` as it reads back from JSON; a type test locks it to the type. */
export declare const tokenCountSchema: z.ZodUnion<readonly [z.ZodReadonly<z.ZodObject<{
    basis: z.ZodEnum<{
        counted: "counted";
        estimated: "estimated";
        reported: "reported";
    }>;
    count: z.ZodNumber;
}, z.core.$strip>>, z.ZodReadonly<z.ZodObject<{
    basis: z.ZodLiteral<"unknown">;
}, z.core.$strip>>]>;
/**
 * The fields of `EmbedOptions`, as a plain object schema so `embedManyOptionsSchema` and
 * `embedStreamOptionsSchema` can extend it. Use `embedOptionsSchema` to check options.
 */
export declare const embedOptionsFields: z.ZodObject<{
    purpose: z.ZodOptional<z.ZodEnum<{
        classification: "classification";
        clustering: "clustering";
        document: "document";
        query: "query";
        similarity: "similarity";
    }>>;
    dimensions: z.ZodOptional<z.ZodNumber>;
    quantization: z.ZodOptional<z.ZodEnum<{
        binary: "binary";
        int8: "int8";
    }>>;
    onTooLong: z.ZodOptional<z.ZodEnum<{
        fail: "fail";
        truncate: "truncate";
    }>>;
    signal: z.ZodOptional<z.ZodCustom<AbortSignal, AbortSignal>>;
}, z.core.$strip>;
/** A recorded call's text inputs and the `EmbedOptions` that change its answer; a type test locks it. */
export declare const embedRequestSchema: z.ZodReadonly<z.ZodObject<{
    purpose: z.ZodOptional<z.ZodEnum<{
        classification: "classification";
        clustering: "clustering";
        document: "document";
        query: "query";
        similarity: "similarity";
    }>>;
    dimensions: z.ZodOptional<z.ZodNumber>;
    quantization: z.ZodOptional<z.ZodEnum<{
        binary: "binary";
        int8: "int8";
    }>>;
    onTooLong: z.ZodOptional<z.ZodEnum<{
        fail: "fail";
        truncate: "truncate";
    }>>;
    inputs: z.ZodReadonly<z.ZodArray<z.ZodString>>;
}, z.core.$strip>>;
//# sourceMappingURL=schemas.d.ts.map