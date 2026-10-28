import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  HealthResponse,
  MarketShockRequest,
  MarketShockResponse,
  NpcTickRequest,
  NpcTickResponse,
} from "@juragan/contracts";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.json()) as T;
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async (): Promise<HealthResponse> => {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error(`API ${res.status}`);
      return (await res.json()) as HealthResponse;
    },
    staleTime: 30_000,
    retry: 1,
  });
}

export function useNpcTick() {
  return useMutation({
    mutationFn: (body: NpcTickRequest) => postJson<NpcTickResponse>("/api/npc-tick", body),
  });
}

export function useMarketShock() {
  return useMutation({
    mutationFn: (body: MarketShockRequest) => postJson<MarketShockResponse>("/api/market-shock", body),
  });
}
