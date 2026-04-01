import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["backend/**/*.test.js"],
    exclude: ["backend/tests/admin/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage/backend",
      include: [
        "backend/utils/paymentEnv.js",
        "backend/utils/payment.js",
        "backend/controllers/patient/appointment.controller.js",
        "backend/controllers/therapist/common.controller.js",
        "backend/services/common.service.js"
      ]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "frontend/src")
    }
  }
});
