import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import viteTsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  // depending on your application, base can also be "/"
  base: "",
  plugins: [react(), viteTsconfigPaths()],
  server: {
    // this sets a default port to 3000
    host: true,
    port: 3000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.test.tsx"],
  },
});
