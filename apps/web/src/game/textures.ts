import { CanvasSource, Texture } from "pixi.js";
import type { TerrainId } from "@juragan/content";

// Tileset prosedural 16x16 via <canvas> + scaleMode nearest (D18, AGENTS.md §1).
const S = 16;

/** LCG deterministik agar speckle stabil antar load. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function makeCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D tidak tersedia");
  return [canvas, ctx];
}

function toTexture(canvas: HTMLCanvasElement): Texture {
  return new Texture({ source: new CanvasSource({ resource: canvas, scaleMode: "nearest" }) });
}

function speckle(ctx: CanvasRenderingContext2D, rand: () => number, color: string, n: number) {
  ctx.fillStyle = color;
  for (let i = 0; i < n; i++) {
    ctx.fillRect(Math.floor(rand() * S), Math.floor(rand() * S), 1, 1);
  }
}

function paintTerrain(t: TerrainId, ctx: CanvasRenderingContext2D, rand: () => number) {
  switch (t) {
    case "grass":
      ctx.fillStyle = "#69A84F";
      ctx.fillRect(0, 0, S, S);
      speckle(ctx, rand, "#5B9450", 14);
      speckle(ctx, rand, "#7CC465", 8);
      break;
    case "road":
      ctx.fillStyle = "#D9B36C";
      ctx.fillRect(0, 0, S, S);
      speckle(ctx, rand, "#C49A58", 12);
      speckle(ctx, rand, "#E8C987", 8);
      break;
    case "wall":
      ctx.fillStyle = "#6B4226";
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = "#4E2E1A";
      for (const y of [3, 7, 11, 15]) ctx.fillRect(0, y, S, 1);
      for (const [x, y] of [[4, 0], [12, 0], [8, 4], [2, 8], [10, 8], [6, 12], [14, 12]] as const)
        ctx.fillRect(x, y, 1, 3);
      ctx.fillStyle = "#8A5A33";
      ctx.fillRect(0, 0, S, 1);
      break;
    case "water":
      ctx.fillStyle = "#3D7EA6";
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = "#5FA8D3";
      ctx.fillRect(2, 4, 5, 1);
      ctx.fillRect(9, 9, 5, 1);
      ctx.fillRect(3, 13, 4, 1);
      break;
    case "tree":
      ctx.fillStyle = "#69A84F";
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = "#4E2E1A";
      ctx.fillRect(7, 10, 2, 6);
      ctx.fillStyle = "#2E6B34";
      ctx.fillRect(3, 2, 10, 9);
      ctx.fillStyle = "#3E8E4D";
      ctx.fillRect(4, 3, 4, 3);
      break;
    case "counter":
      ctx.fillStyle = "#8A5A33";
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = "#E8A33D";
      ctx.fillRect(0, 0, S, 4);
      ctx.fillStyle = "#4E2E1A";
      ctx.fillRect(0, 4, S, 1);
      ctx.fillStyle = "#6B4226";
      ctx.fillRect(2, 8, 4, 5);
      ctx.fillRect(10, 8, 4, 5);
      break;
    case "door":
      ctx.fillStyle = "#4E2E1A";
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = "#8A5A33";
      ctx.fillRect(3, 1, 10, 14);
      ctx.fillStyle = "#E8A33D";
      ctx.fillRect(11, 8, 2, 2);
      break;
    case "gate":
      ctx.fillStyle = "#9AA0A6";
      ctx.fillRect(0, 0, S, S);
      ctx.fillStyle = "#6B7280";
      ctx.fillRect(0, 0, 3, S);
      ctx.fillRect(13, 0, 3, S);
      ctx.fillStyle = "#1F4D3A";
      ctx.fillRect(0, 0, S, 3);
      ctx.fillStyle = "#E8A33D";
      ctx.fillRect(5, 1, 6, 1);
      break;
  }
}

export function buildTileTextures(): Record<TerrainId, Texture> {
  const ids: TerrainId[] = ["grass", "road", "wall", "water", "tree", "counter", "door", "gate"];
  const out = {} as Record<TerrainId, Texture>;
  ids.forEach((id, i) => {
    const [canvas, ctx] = makeCanvas();
    paintTerrain(id, ctx, rng(1000 + i));
    out[id] = toTexture(canvas);
  });
  return out;
}

export function buildCharacterTexture(shirt: string, skin = "#E8B98A"): Texture {
  const [canvas, ctx] = makeCanvas();
  // Kepala
  ctx.fillStyle = skin;
  ctx.fillRect(6, 1, 4, 5);
  ctx.fillStyle = "#2B2118";
  ctx.fillRect(6, 1, 4, 1);
  // Badan
  ctx.fillStyle = shirt;
  ctx.fillRect(5, 6, 6, 5);
  ctx.fillStyle = skin;
  ctx.fillRect(4, 7, 1, 3);
  ctx.fillRect(11, 7, 1, 3);
  // Kaki
  ctx.fillStyle = "#2B2118";
  ctx.fillRect(6, 11, 2, 4);
  ctx.fillRect(8, 11, 2, 4);
  return toTexture(canvas);
}

export function buildMarkerTexture(): Texture {
  const [canvas, ctx] = makeCanvas();
  ctx.fillStyle = "#E8A33D";
  ctx.fillRect(7, 2, 2, 7);
  ctx.fillRect(7, 11, 2, 2);
  ctx.fillStyle = "#1F4D3A";
  ctx.fillRect(6, 1, 4, 1);
  ctx.fillRect(6, 9, 1, 4);
  ctx.fillRect(9, 9, 1, 4);
  return toTexture(canvas);
}
