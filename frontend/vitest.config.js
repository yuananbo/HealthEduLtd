import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setupTests.js",
    globals: true,
    include: ["src/**/*.test.{js,jsx}", "tests/**/*.test.{js,jsx}"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage/frontend",
      include: [
        "src/components/PatientDashboard/pages/services/AssistiveDevice.jsx",
        "src/components/PatientDashboard/pages/appointment/AppointmentDetails.jsx",
        "src/components/admin/pages/bookings/BookingDetails.jsx",
        "src/components/admin/pages/bookings/BookingsList.jsx",
        "src/components/admin/pages/content/ContentDetails.jsx",
        "src/components/admin/pages/content/ContentList.jsx",
        "src/components/admin/pages/content/CreateContent.jsx",
        "src/components/admin/pages/users/AllUsers.jsx",
        "src/components/admin/pages/users/UserDetails.jsx",
        "src/components/TherapistDashboard/pages/dasboard/Dashboard.jsx",
        "src/components/TherapistDashboard/pages/profile/RatingsTab.jsx",
        "src/components/TherapistDashboard/pages/appointments/AppointmentDetails.jsx"
      ]
    }
  }
});
