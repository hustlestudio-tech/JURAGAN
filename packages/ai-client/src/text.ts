import { generateText } from 'ai';
import { MODEL_TIMEOUT_MS, createMetaModel, type MetaEnv } from './meta';

/** Teks biasa bertoken terbatas untuk Asisten Kontrak & hint (S4/S6). Tanpa tool. */
export async function completeText(
  system: string,
  user: string,
  maxTokens: number,
  env: MetaEnv,
  fetchFn: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const { text } = await generateText({
      model: createMetaModel(env, fetchFn),
      instructions: system,
      prompt: user,
      maxOutputTokens: maxTokens,
      temperature: 0.3,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
    });
    return text || null;
  } catch {
    return null;
  }
}
