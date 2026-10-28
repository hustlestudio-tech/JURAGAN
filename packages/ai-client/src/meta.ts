import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// Transport AI SDK ke Meta Model API (OpenAI-compatible). Model TETAP Muse Spark.
export const META_BASE_URL = 'https://api.meta.ai/v1';
export const DEFAULT_MODEL_ID = 'muse-spark-1.3';
export const MODEL_TIMEOUT_MS = 2500;

export interface MetaEnv {
  apiKey: string | undefined;
  modelId: string;
}

export function readMetaEnv(
  env: Record<string, string | undefined> = process.env,
): MetaEnv {
  return {
    apiKey: env['MODEL_API_KEY'],
    modelId: env['META_MODEL_ID'] ?? DEFAULT_MODEL_ID,
  };
}

/** Model chat Meta (muse-spark). fetchFn dapat di-inject untuk test. */
export function createMetaModel(env: MetaEnv, fetchFn: typeof fetch = fetch) {
  if (!env.apiKey) throw new Error('MODEL_API_KEY tidak diset');
  const meta = createOpenAICompatible({
    name: 'meta',
    apiKey: env.apiKey,
    baseURL: META_BASE_URL,
    fetch: fetchFn,
    supportsStructuredOutputs: true,
  });
  return meta.chatModel(env.modelId);
}
