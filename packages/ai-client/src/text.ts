import { chatCompletions, type MetaEnv } from "./meta";

/** Teks biasa bertoken terbatas untuk Asisten Kontrak & hint (S4/S6). Tanpa tool. */
export async function completeText(
  system: string,
  user: string,
  maxTokens: number,
  env: MetaEnv,
  fetchFn: typeof fetch = fetch,
): Promise<string | null> {
  try {
    const { content } = await chatCompletions(
      {
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
      },
      env,
      fetchFn,
    );
    return content;
  } catch {
    return null;
  }
}
