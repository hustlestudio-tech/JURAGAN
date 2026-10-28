import { defineConfig } from 'drizzle-kit';

// Bun memuat .env otomatis; tidak perlu dotenv.
export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
});
