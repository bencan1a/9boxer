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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core libraries
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom")
          ) {
            return "vendor-react";
          }

          // MUI components - split into separate chunk
          if (id.includes("node_modules/@mui")) {
            return "vendor-mui";
          }

          // Recharts library - split into separate chunk
          if (id.includes("node_modules/recharts")) {
            return "vendor-recharts";
          }

          // i18n libraries
          if (
            id.includes("node_modules/i18next") ||
            id.includes("node_modules/react-i18next")
          ) {
            return "vendor-i18n";
          }

          // DnD Kit libraries
          if (id.includes("node_modules/@dnd-kit")) {
            return "vendor-dnd";
          }

          // Emotion styling
          if (id.includes("node_modules/@emotion")) {
            return "vendor-emotion";
          }

          // Other vendor dependencies
          if (id.includes("node_modules")) {
            return "vendor-other";
          }
        },
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
