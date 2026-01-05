import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      filename: "dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  base: "./", // CRITICAL: Use relative paths for file:// protocol in Electron
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    emptyOutDir: true,
    // Performance budgets - warn if chunks exceed these sizes
    chunkSizeWarningLimit: 1000, // 1 MB warning threshold
    rollupOptions: {
      output: {
        // Let Vite handle chunking automatically to avoid circular dependencies
        // Manual chunking was causing module initialization order issues in production
        // Naming pattern for chunks with content hash for cache busting
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
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
