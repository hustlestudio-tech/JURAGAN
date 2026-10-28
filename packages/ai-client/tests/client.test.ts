import { describe, expect, test } from 'bun:test';
import { runNpcTick } from '../src/npcTick';
import { proposeMarketShock } from '../src/marketShock';
import type { MetaEnv } from '../src/meta';

const ENV: MetaEnv = { apiKey: 'test-key', modelId: 'muse-spark-1.3' };
const REQ = {
  npcId: 'vendor' as const,
  week: 3,
  tickIndex: 1,
  playerPlace: 'kedai' as const,
  npcPlace: 'pasar' as const,
};

function chatCompletion(message: unknown) {
  return new Response(
    JSON.stringify({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: 1,
      model: 'muse-spark-1.3',
      choices: [{ index: 0, message, finish_reason: 'stop' }],
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    }),
    { status: 200 },
  );
}

function toolMessage(args: unknown) {
  return {
    role: 'assistant',
    content: null,
    tool_calls: [
      {
        id: 'call-1',
        type: 'function',
        function: { name: 'npc_action', arguments: JSON.stringify(args) },
      },
    ],
  };
}

describe('runNpcTick (AI SDK)', () => {
  test('tool call valid -> source model, wire body benar', async () => {
    let seenBody = '';
    const fetchFn = (async (url: unknown, init: { body?: unknown }) => {
      seenBody = String(init.body ?? '');
      return chatCompletion(
        toolMessage({
          type: 'walk_to',
          place: 'kedai',
          topic: null,
          offerId: null,
        }),
      );
    }) as unknown as typeof fetch;
    const res = await runNpcTick(REQ, ENV, fetchFn);
    expect(res.source).toBe('model');
    expect(res.action).toEqual({
      type: 'walk_to',
      place: 'kedai',
      topic: null,
      offerId: null,
    });
    expect(res.log.validation).toBe('ok');
    const body = JSON.parse(seenBody) as Record<string, unknown>;
    expect(body['model']).toBe('muse-spark-1.3');
    expect(body['tool_choice']).toBe('auto');
    const tools = body['tools'] as { function: { name: string } }[];
    expect(tools[0]?.function.name).toBe('npc_action');
  });

  test('tanpa tool call -> fallback tanpa retry', async () => {
    const fetchFn = (async () =>
      chatCompletion({
        role: 'assistant',
        content: 'halo',
      })) as unknown as typeof fetch;
    const res = await runNpcTick(REQ, ENV, fetchFn);
    expect(res.source).toBe('fallback');
    expect(res.log.validation).toBe('fallback');
  });

  test('argumen tak lolos Zod -> fallback', async () => {
    const fetchFn = (async () =>
      chatCompletion(
        toolMessage({ type: 'terbang' }),
      )) as unknown as typeof fetch;
    const res = await runNpcTick(REQ, ENV, fetchFn);
    expect(res.source).toBe('fallback');
  });

  test('fetch gagal -> fallback deterministik', async () => {
    const failing = (async () => {
      throw new Error('timeout');
    }) as unknown as typeof fetch;
    const res = await runNpcTick(REQ, ENV, failing);
    expect(res.source).toBe('fallback');
    expect(res.action).toEqual({
      type: 'walk_to',
      place: 'kedai',
      topic: null,
      offerId: null,
    });
  });

  test('tanpa API key -> fallback', async () => {
    const res = await runNpcTick(REQ, {
      apiKey: undefined,
      modelId: 'muse-spark-1.3',
    });
    expect(res.source).toBe('fallback');
  });
});

describe('proposeMarketShock (AI SDK)', () => {
  test('proposal valid -> dikembalikan dengan clamp', async () => {
    const fetchFn = (async () =>
      chatCompletion({
        role: 'assistant',
        content: JSON.stringify({
          concept_id: 'price-elasticity',
          price_multiplier: 2.0,
          demand_multiplier: 0.5,
          headline_game: 'Gula naik!',
        }),
      })) as unknown as typeof fetch;
    const res = await proposeMarketShock(
      { week: 2, headline: 'Harga gula naik' },
      ENV,
      fetchFn,
    );
    expect(res).not.toBeNull();
    expect(res!.price_multiplier).toBe(1.3);
    expect(res!.demand_multiplier).toBe(0.85);
  });

  test('concept_id di luar enum -> null (pakai kurasi)', async () => {
    const fetchFn = (async () =>
      chatCompletion({
        role: 'assistant',
        content: JSON.stringify({
          concept_id: 'politik',
          price_multiplier: 1,
          demand_multiplier: 1,
          headline_game: 'x',
        }),
      })) as unknown as typeof fetch;
    expect(
      await proposeMarketShock({ week: 2, headline: 'x' }, ENV, fetchFn),
    ).toBeNull();
  });
});
