import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.spec.ts", "tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  },
  resolve: {
    alias: {
      "@domain": path.resolve(__dirname, "./src/domain"),
      "@usecases": path.resolve(__dirname, "./src/use-cases"),
      "@adapters": path.resolve(__dirname, "./src/adapters"),
      "@infra": path.resolve(__dirname, "./src/infrastructure")
    }
  }
});
