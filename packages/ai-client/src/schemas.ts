// Skema strict Meta: additionalProperties:false + SEMUA properti di required (AGENTS.md §3).
// npc_action DATAR (tanpa oneOf) karena subset strict tidak mendukung union.

export const NPC_ACTION_TOOL = {
  type: "function",
  function: {
    name: "npc_action",
    description: "Pilih tepat satu aksi NPC untuk tick ini.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: { type: "string", enum: ["walk_to", "speak", "offer", "wait"] },
        place: { type: ["string", "null"], enum: ["kedai", "gudang", "pasar", "gerbang", null] },
        topic: { type: ["string", "null"] },
        offerId: { type: ["string", "null"] },
      },
      required: ["type", "place", "topic", "offerId"],
    },
  },
} as const;

export const MARKET_SHOCK_FORMAT = {
  type: "json_schema",
  json_schema: {
    name: "market_shock",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        concept_id: {
          type: "string",
          enum: [
            "break-even",
            "working-capital",
            "cashflow-vs-profit",
            "price-elasticity",
            "contract-risk",
            "supplier-verification",
          ],
        },
        price_multiplier: { type: "number" },
        demand_multiplier: { type: "number" },
        headline_game: { type: "string" },
      },
      required: ["concept_id", "price_multiplier", "demand_multiplier", "headline_game"],
    },
  },
} as const;
