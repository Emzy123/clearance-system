import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

/** Resolves hoisted (workspace root) or local client node_modules. */
function packageRoot(name) {
  return path.dirname(require.resolve(`${name}/package.json`));
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      react: packageRoot("react"),
      "react-dom": packageRoot("react-dom")
    }
  },
  server: {
    port: 5173,
    fs: {
      allow: [monorepoRoot]
    }
  },
  preview: {
    port: 4173
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-charts": ["recharts"],
          "vendor-motion": ["framer-motion"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-socket": ["socket.io-client"]
        }
      }
    }
  }
});
