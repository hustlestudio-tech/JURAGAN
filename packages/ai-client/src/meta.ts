// Raw fetch ke Meta Model API — nol dependensi SDK (adentum §3, AGENTS.md §3).
export const META_CHAT_URL = "https://api.meta.ai/v1/chat/completions";
export const DEFAULT_MODEL_ID = "muse-spark-1.3";
export const MODEL_TIMEOUT_MS = 2500;

export interface MetaEnv {
  apiKey: string | undefined;
  modelId: string;
}

export function readMetaEnv(env: Record<string, string | undefined> = process.env): MetaEnv {
  return {
    apiKey: env["MODEL_API_KEY"],
    modelId: env["META_MODEL_ID"] ?? DEFAULT_MODEL_ID,
  };
}

interface ChatPayload {
  model: string;
  messages: { role: "system" | "user"; content: string }[];
  tools?: unknown[];
  tool_choice?: "auto";
  parallel_tool_calls?: false;
  response_format?: unknown;
  max_tokens?: number;
  temperature?: number;
}

export interface ToolCall {
  function: { name: string; arguments: string };
}

export interface ChatResult {
  content: string | null;
  toolCalls: ToolCall[];
}

export async function chatCompletions(
  payload: Omit<ChatPayload, "model"> & { model?: string },
  env: MetaEnv,
  fetchFn: typeof fetch = fetch,
): Promise<ChatResult> {
  if (!env.apiKey) throw new Error("MODEL_API_KEY tidak diset");
  const res = await fetchFn(META_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.apiKey}` },
    body: JSON.stringify({ model: env.modelId, ...payload }),
    signal: AbortSignal.timeout(MODEL_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Meta API ${res.status}`);
  const json = (await res.json()) as {
    choices?: { message?: { content?: string | null; tool_calls?: ToolCall[] } }[];
  };
  const msg = json.choices?.[0]?.message;
  return { content: msg?.content ?? null, toolCalls: msg?.tool_calls ?? [] };
}
