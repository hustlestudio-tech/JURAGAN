import { NpcActionFlatSchema, type NpcTickRequest, type NpcTickResponse } from "@juragan/contracts";
import { deterministicNpcAction } from "@juragan/sim-core";
import { chatCompletions, type MetaEnv } from "./meta";
import { NPC_ACTION_TOOL } from "./schemas";

const ROLE_BRIEF: Record<string, string> = {
  vendor: "Kamu Vendor Misterius, pemasok baru yang ramah namun licik. Tujuanmu mendekati pemain dan menawarkan harga murah.",
  dimas: "Kamu Dimas, teman pemain. Kamu hanya memberi hint berupa pertanyaan pemandu, bukan jawaban.",
  "pak-hendra": "Kamu Pak Hendra, pemilik gudang yang formal. Kamu menawarkan kontrak pemasok.",
  "pak-budi": "Kamu Pak Budi, pedagang pasar yang jujur. Kamu tidak mengenal Vendor Misterius.",
};

export async function runNpcTick(
  req: NpcTickRequest,
  env: MetaEnv,
  fetchFn: typeof fetch = fetch,
): Promise<NpcTickResponse> {
  const started = Date.now();
  const fallback = (): NpcTickResponse => {
    const a = deterministicNpcAction(req.npcId, req.tickIndex);
    return {
      action: {
        type: a.type,
        place: a.type === "walk_to" ? a.place : null,
        topic: null,
        offerId: null,
      },
      source: "fallback",
      log: {
        npcId: req.npcId,
        tool: "npc_action",
        args: { tickIndex: req.tickIndex },
        validation: "fallback",
        source: "fallback",
        latencyMs: Date.now() - started,
      },
    };
  };

  try {
    const { toolCalls } = await chatCompletions(
      {
        messages: [
          {
            role: "system",
            content: `${ROLE_BRIEF[req.npcId] ?? ""} Pilih TEPAT SATU aksi lewat tool npc_action. Minggu ${req.week}, kamu di ${req.npcPlace}, pemain di ${req.playerPlace}.`,
          },
          { role: "user", content: `tick ${req.tickIndex}: apa aksimu?` },
        ],
        tools: [NPC_ACTION_TOOL],
        tool_choice: "auto",
        parallel_tool_calls: false,
        max_tokens: 200,
      },
      env,
      fetchFn,
    );
    // Tanpa tool call -> tick gagal -> fallback, tanpa retry (AGENTS.md §3).
    const raw = toolCalls[0]?.function.arguments;
    if (!raw) return fallback();
    const parsed = NpcActionFlatSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return fallback();
    const action = parsed.data;
    // Validator aturan: walk_to wajib punya place sah.
    if (action.type === "walk_to" && !action.place) return fallback();
    return {
      action,
      source: "model",
      log: {
        npcId: req.npcId,
        tool: "npc_action",
        args: action as unknown as Record<string, unknown>,
        validation: "ok",
        source: "model",
        latencyMs: Date.now() - started,
      },
    };
  } catch {
    return fallback();
  }
}
