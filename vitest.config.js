import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environmentMatchGlobs: [
      ["backend/**", "node"],
      ["frontend/**", "jsdom"],
    ],
    setupFiles: ["./frontend/src/test/setup.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: [
        "backend/utils/paymentEnv.js",
        "backend/utils/payment.js",
        "frontend/src/utils/paymentFlow.js",
        "frontend/src/components/PatientDashboard/pages/appointment/PayForAppointment.jsx",
        "backend/controllers/patient/appointment.controller.js",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "frontend/src"),
    },
  },
});
