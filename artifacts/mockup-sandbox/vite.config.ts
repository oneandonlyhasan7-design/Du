import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Optional plugins (safe handling)
let runtimeErrorOverlay: any = null;
let mockupPreviewPlugin: any = null;

try {
  runtimeErrorOverlay = require("@replit/vite-plugin-runtime-error-modal");
} catch {}

try {
  mockupPreviewPlugin = require("./mockupPreviewPlugin");
} catch {}

export default defineConfig({
  base: process.env.BASE_PATH || "/", // fallback for Vercel

  plugins: [
    react(),
    tailwindcss(),
    ...(mockupPreviewPlugin ? [mockupPreviewPlugin.mockupPreviewPlugin?.()] : []),
    ...(runtimeErrorOverlay ? [runtimeErrorOverlay()] : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  root: path.resolve(__dirname),

  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },

  server: {
    port: Number(process.env.PORT) || 5173, // fallback instead of crash
    host: "0.0.0.0",
  },

  preview: {
    port: Number(process.env.PORT) || 5173,
    host: "0.0.0.0",
  },
});
