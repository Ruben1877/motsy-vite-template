import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const machineId = process.env.FLY_MACHINE_ID || process.env.MACHINE_ID || "";
const routerHost = process.env.ROUTER_HOST || "preview.motsy.dev";

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
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-router-dom",
      "lucide-react",
      "framer-motion",
      "sonner",
      "vaul",
      "cmdk",
      "input-otp",
      "react-hook-form",
      "react-day-picker",
      "react-resizable-panels",
      "embla-carousel-react",
      "recharts",
      "@hookform/resolvers/zod",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-label",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
    ],
  },
});
