import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: false,
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name].[ext]",
        chunkFileNames: "assets/[name].[ext]",
        entryFileNames: "assets/[name].js",
      },
    },
  },
  server: {
    proxy: {
      "/react": "http://localhost:3000",
    },
  },
  plugins: [react()],
});
