import { describe, expect, test } from "bun:test";
import { runNpcTick } from "../src/npcTick";
import { proposeMarketShock } from "../src/marketShock";
import type { MetaEnv } from "../src/meta";

const ENV: MetaEnv = { apiKey: "test-key", modelId: "muse-spark-1.3" };
const REQ = { npcId: "vendor" as const, week: 3, tickIndex: 1, playerPlace: "kedai" as const, npcPlace: "pasar" as const };

const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

describe("runNpcTick", () => {
  test("tool call valid -> source model", async () => {
    const fetchFn = (async () =>
      jsonResponse({
        choices: [
          {
            message: {
              content: null,
              tool_calls: [
                { function: { name: "npc_action", arguments: JSON.stringify({ type: "walk_to", place: "kedai", topic: null, offerId: null }) } },
              ],
            },
          },
        ],
      })) as unknown as typeof fetch;
    const res = await runNpcTick(REQ, ENV, fetchFn);
    expect(res.source).toBe("model");
    expect(res.action).toEqual({ type: "walk_to", place: "kedai", topic: null, offerId: null });
    expect(res.log.validation).toBe("ok");
  });

  test("tanpa tool call -> fallback tanpa retry", async () => {
    const fetchFn = (async () =>
      jsonResponse({ choices: [{ message: { content: "halo", tool_calls: [] } }] })) as unknown as typeof fetch;
    const res = await runNpcTick(REQ, ENV, fetchFn);
    expect(res.source).toBe("fallback");
    expect(res.log.validation).toBe("fallback");
  });

  test("argumen tak lolos Zod -> fallback", async () => {
    const fetchFn = (async () =>
      jsonResponse({
        choices: [
          { message: { content: null, tool_calls: [{ function: { name: "npc_action", arguments: JSON.stringify({ type: "terbang" }) } }] } },
        ],
      })) as unknown as typeof fetch;
    const res = await runNpcTick(REQ, ENV, fetchFn);
    expect(res.source).toBe("fallback");
  });

  test("fetch gagal / timeout -> fallback deterministik", async () => {
    const failing = (async () => {
      throw new Error("timeout");
    }) as unknown as typeof fetch;
    const res = await runNpcTick(REQ, ENV, failing);
    expect(res.source).toBe("fallback");
    // tickIndex 1 vendor -> rotasi kedua = kedai (sama dengan sim-core).
    expect(res.action).toEqual({ type: "walk_to", place: "kedai", topic: null, offerId: null });
  });

  test("tanpa API key -> fallback", async () => {
    const res = await runNpcTick(REQ, { apiKey: undefined, modelId: "muse-spark-1.3" });
    expect(res.source).toBe("fallback");
  });
});

describe("proposeMarketShock", () => {
  test("proposal valid -> dikembalikan dengan clamp", async () => {
    const fetchFn = (async () =>
      jsonResponse({
        choices: [
          {
            message: {
              content: JSON.stringify({
                concept_id: "price-elasticity",
                price_multiplier: 2.0,
                demand_multiplier: 0.5,
                headline_game: "Gula naik!",
              }),
            },
          },
        ],
      })) as unknown as typeof fetch;
    const res = await proposeMarketShock({ week: 2, headline: "Harga gula naik" }, ENV, fetchFn);
    expect(res).not.toBeNull();
    expect(res!.price_multiplier).toBe(1.3);
    expect(res!.demand_multiplier).toBe(0.85);
  });

  test("concept_id di luar enum -> null (pakai kurasi)", async () => {
    const fetchFn = (async () =>
      jsonResponse({
        choices: [{ message: { content: JSON.stringify({ concept_id: "politik", price_multiplier: 1, demand_multiplier: 1, headline_game: "x" }) } }],
      })) as unknown as typeof fetch;
    expect(await proposeMarketShock({ week: 2, headline: "x" }, ENV, fetchFn)).toBeNull();
  });
});
