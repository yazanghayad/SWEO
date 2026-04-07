/**
 * Shared OpenAI-compatible client factory.
 *
 * Uses NVIDIA API when NVIDIA_API_KEY is set, otherwise falls back to
 * OPENAI_API_KEY. Both expose the same OpenAI-compatible REST interface.
 */

import OpenAI from 'openai';

let _client: OpenAI | null = null;

/**
 * Returns a singleton OpenAI SDK client configured for whichever
 * provider has credentials in the environment.
 *
 * Priority: NVIDIA_API_KEY > OPENAI_API_KEY
 */
export function getAIClient(): OpenAI {
  if (!_client) {
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const nvidiaUrl = process.env.NVIDIA_API_URL;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (nvidiaKey) {
      // NVIDIA NIM / Inference API – OpenAI-compatible
      _client = new OpenAI({
        apiKey: nvidiaKey,
        baseURL:
          nvidiaUrl?.replace(/\/chat\/completions\/?$/, '') ??
          'https://integrate.api.nvidia.com/v1'
      });
    } else if (openaiKey) {
      _client = new OpenAI({ apiKey: openaiKey });
    } else {
      // Fallback – will error on first call but doesn't crash at import
      _client = new OpenAI({ apiKey: '' });
    }
  }
  return _client;
}

/**
 * Default model to use for chat completions.
 * NVIDIA endpoints typically serve a specific model behind the URL,
 * so we use a sensible default per provider.
 */
export function getDefaultModel(): string {
  if (process.env.NVIDIA_API_KEY) {
    return process.env.NVIDIA_MODEL ?? 'meta/llama-3.1-70b-instruct';
  }
  return 'gpt-4o';
}

/**
 * Check whether the active model is a reasoning / chain-of-thought model.
 * Reasoning models (e.g. openai/gpt-oss-120b) use `reasoning` tokens
 * before producing `content`, so callers need higher max_tokens and must
 * handle `content: null` when the budget is exhausted during reasoning.
 */
export function isReasoningModel(): boolean {
  const model = getDefaultModel().toLowerCase();
  return (
    model.includes('oss') ||
    model.includes('reasoning') ||
    model.includes('o1') ||
    model.includes('o3') ||
    model.includes('o4') ||
    model.includes('deepseek-r1') ||
    model.includes('qwq')
  );
}

/**
 * Default embedding model. NVIDIA uses nvidia/nv-embedqa-e5-v5,
 * OpenAI uses text-embedding-3-large.
 */
export function getEmbeddingModel(): string {
  if (process.env.NVIDIA_API_KEY) {
    return process.env.NVIDIA_EMBEDDING_MODEL ?? 'nvidia/nv-embedqa-e5-v5';
  }
  return 'text-embedding-3-large';
}
