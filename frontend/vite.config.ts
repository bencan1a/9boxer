import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // CRITICAL: Use relative paths for file:// protocol in Electron
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    emptyOutDir: true,
  },
  server: {
    port: 5173, // Vite default port for dev server
    proxy: {
      "/api": {
        target: "http://backend:8000", // Use docker service name
        changeOrigin: true,
      },
    },
  },
});
