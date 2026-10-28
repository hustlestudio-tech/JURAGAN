// DEV TOOLING — menjalankan packages/db/migrations/*.sql secara berurutan.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL tidak diset. Salin .env.example ke .env lalu isi.");
  process.exit(1);
}

const dir = join(import.meta.dir, "..", "packages", "db", "migrations");
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
if (files.length === 0) {
  console.error(`Tidak ada migrasi di ${dir}`);
  process.exit(1);
}

const sql = neon(url);
for (const f of files) {
  const statements = readFileSync(join(dir, f), "utf8");
  await sql(statements);
  console.log(`[migrate] ${f} ok`);
}
console.log("[migrate] selesai");
