/** Every provider this package can build a model record for. `fake` is the deterministic test embedder. */
export const EMBEDDING_PROVIDERS = [
    'ollama',
    'openai',
    'voyage',
    'google',
    'cohere',
    'mistral',
    'jina',
    'bedrock',
    'transformers',
    'openai-compatible',
    'tei',
    'fake',
];
/** Why a text is embedded. Asymmetric models prefix queries and documents differently. */
export const PURPOSES = ['query', 'document', 'similarity', 'classification', 'clustering'];
/** The output dtype of a vector. `float32` is every provider's default. */
export const QUANTIZATIONS = ['float32', 'int8', 'binary'];
//# sourceMappingURL=types.js.map