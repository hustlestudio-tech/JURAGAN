import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Samakan dengan API_PORT saat dev:api dijalankan di port lain.
      '/api': `http://localhost:${process.env.API_PORT ?? 8787}`,
    },
  },
});
