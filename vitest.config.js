import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["backend/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage/backend",
      include: [
        "backend/controllers/therapist/common.controller.js",
        "backend/services/common.service.js",
      ],
    },
  },
});
