import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const serverPort = Number(process.env.PORT ?? 3000);

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/socket.io': { target: `http://localhost:${serverPort}`, ws: true },
    },
  },
  build: { outDir: 'dist', emptyOutDir: true },
});
