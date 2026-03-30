import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-charts': ['recharts'],
          'vendor-ui': ['@radix-ui/react-slot', '@radix-ui/react-select', '@radix-ui/react-popover', '@radix-ui/react-dialog', 'lucide-react'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
  },
}));
