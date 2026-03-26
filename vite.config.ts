import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Manual chunking to split large vendor bundles into smaller pieces
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;
          if (id.match(/node_modules\/(react|react-dom)(\/|$)/)) return "vendor_react";
          if (id.match(/node_modules\/react-router-dom(\/|$)/)) return "vendor_router";
          if (id.match(/node_modules\/@tanstack(\/|$)/)) return "vendor_query";
          if (id.match(/node_modules\/@supabase(\/|$)/)) return "vendor_supabase";
          if (id.match(/node_modules\/recharts(\/|$)/)) return "vendor_recharts";
          if (id.match(/node_modules\/lucide-react(\/|$)/)) return "vendor_icons";
          if (id.match(/node_modules\/sonner(\/|$)/)) return "vendor_sonner";
          if (id.match(/node_modules\/@radix-ui(\/|$)/)) return "vendor_radix";
          // Let Rollup decide for other node_modules (avoid a generic vendor_misc fallback)
          return;
        },
      },
    },
  },
}));
