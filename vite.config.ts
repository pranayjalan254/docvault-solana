import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [react(), nodePolyfills()],
  define: {
    global: "window", // Ensure `global` is defined in the browser environment
  },
  resolve: {
    alias: {
      buffer: "buffer",
      process: "process/browser",
    },
  },
});
