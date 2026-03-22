import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.js",
    include: ["src/**/*.test.jsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage/frontend",
      include: [
        "src/components/PatientDashboard/pages/appointment/AppointmentDetails.jsx",
        "src/components/TherapistDashboard/pages/dasboard/Dashboard.jsx",
        "src/components/TherapistDashboard/pages/profile/RatingsTab.jsx",
        "src/components/TherapistDashboard/pages/appointments/AppointmentDetails.jsx",
      ],
    },
  },
});
