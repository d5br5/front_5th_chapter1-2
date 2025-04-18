import { defineConfig as defineTestConfig, mergeConfig } from "vitest/config";
import { defineConfig } from "vite";
import { resolve } from "path";

export default mergeConfig(
  defineConfig({
    esbuild: {
      jsxFactory: "createVNode",
      jsxFragment: "Fragment",
    },
    optimizeDeps: {
      esbuildOptions: {
        jsx: "transform",
        jsxFactory: "createVNode",
        jsxFragment: "Fragment",
      },
    },
  }),
  defineTestConfig({
    base:
      process.env.NODE_ENV === "production" ? "/front_5th_chapter1-2/" : "/",
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          hash: resolve(__dirname, "index.hash.html"),
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.js",
      exclude: ["**/e2e/**", "**/*.e2e.spec.js", "**/node_modules/**"],
    },
  }),
);
