import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const machineId = process.env.MACHINE_ID || "";
const routerHost = process.env.ROUTER_HOST || "motsy-router.fly.dev";

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
          path: `/${machineId}/`,
        }
      : undefined,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
