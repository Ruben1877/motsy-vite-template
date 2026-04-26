import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

const machineId = process.env.FLY_MACHINE_ID || process.env.MACHINE_ID || "";
const routerHost = process.env.ROUTER_HOST || "preview.motsy.dev";

const STATIC_INCLUDE = [
  "react",
  "react-dom",
  "react-dom/client",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
];

function detectReactUsingDeps(): string[] {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "./package.json"), "utf8"),
    );
    const deps = Object.keys(pkg.dependencies || {});
    const result: string[] = [];
    for (const name of deps) {
      if (name === "react" || name === "react-dom") continue;
      try {
        const depPkgPath = path.resolve(__dirname, "node_modules", name, "package.json");
        if (!fs.existsSync(depPkgPath)) continue;
        const depPkg = JSON.parse(fs.readFileSync(depPkgPath, "utf8"));
        const peers = depPkg.peerDependencies || {};
        const directDeps = depPkg.dependencies || {};
        if (peers.react !== undefined || directDeps.react !== undefined) {
          result.push(name);
        }
      } catch {
        // skip unreadable dep
      }
    }
    return result;
  } catch {
    return [];
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: machineId ? `/${machineId}/` : "/",
  server: {
    host: "::",
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    hmr: machineId
      ? {
          protocol: "wss",
          host: routerHost,
          clientPort: 443,
        }
      : undefined,
    warmup: {
      clientFiles: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: [...STATIC_INCLUDE, ...detectReactUsingDeps()],
  },
});
