// DEV ONLY — tidak ikut deploy ke Vercel. Bun.serve diizinkan di scripts/ (AGENTS.md §4).
import { createApp } from "../apps/api/src/app";

const port = Number(process.env.API_PORT ?? 8787);
const app = createApp();

Bun.serve({ port, fetch: app.fetch });
// eslint-disable-next-line no-console
console.log(`[juragan:api] http://localhost:${port}`);
