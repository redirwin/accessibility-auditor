import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    environmentMatchGlobs: [["app/**/*.test.tsx", "jsdom"]],
    setupFiles: ["./test/setup.ts"],
  },
})
