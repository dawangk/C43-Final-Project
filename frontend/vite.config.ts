import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0", // Allow access from external devices
    port: 5173, // Ensure it's using the correct port
    strictPort: true, // Ensure it doesn't pick a different port if 5173 is in use
    open: false, // Prevent auto-opening a browser on the server
  },
});
