import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "./Dashboard";
import { UserContext } from "../../../../context/UserContext";
import api from "../../../../utils/api";

vi.mock("./TherapistProfile", () => ({
  default: ({ darkMode }) => (
    <div>{darkMode ? "TherapistProfile dark" : "TherapistProfile light"}</div>
  ),
}));

vi.mock("./UpcomingAppointments", () => ({
  default: ({ darkMode }) => (
    <div>{darkMode ? "UpcomingAppointments dark" : "UpcomingAppointments light"}</div>
  ),
}));

vi.mock("./StatCard", () => ({
  default: ({ title, value, loading }) => (
    <div>
      {title}: {loading ? "loading" : String(value)}
    </div>
  ),
}));

vi.mock("./Chart", () => ({
  default: ({ data }) => <div>Chart points: {data.length}</div>,
}));

vi.mock("../../../../utils/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

const renderDashboard = (currentUser = { token: "token-1" }) =>
  render(
    <UserContext.Provider value={{ currentUser }}>
      <Dashboard />
    </UserContext.Provider>
  );

describe("Therapist Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders therapist statistics, chart data, and recent patients after loading", async () => {
    api.get.mockResolvedValue({
      status: 200,
      data: {
        totalAppointments: 12,
        totalPatients: 8,
        totalIncome: 540,
        overallRating: 4.25,
        performanceOverview: [1, 2, 3],
        recentPatients: [
          {
            id: "p-1",
            name: "Mia Wang",
            age: 36,
            lastVisit: "2026-03-20T00:00:00.000Z",
          },
        ],
      },
    });

    renderDashboard();

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("therapist/my-statistics", {});
    });

    expect(screen.getByText("Appointments: 12")).toBeTruthy();
    expect(screen.getByText("Patients: 8")).toBeTruthy();
    expect(screen.getByText("Income: 540")).toBeTruthy();
    expect(screen.getByText("Rating: 4.3")).toBeTruthy();
    expect(screen.getByText("Chart points: 3")).toBeTruthy();
    expect(screen.getByText("Mia Wang")).toBeTruthy();
    expect(screen.getByText("36")).toBeTruthy();
  });

  it("shows default values and empty state when there is no patient data", async () => {
    api.get.mockResolvedValue({
      status: 200,
      data: {
        performanceOverview: [],
        recentPatients: [],
      },
    });

    renderDashboard();

    expect(await screen.findByText("Appointments: 0")).toBeTruthy();
    expect(screen.getByText("Patients: 0")).toBeTruthy();
    expect(screen.getByText("Income: 0")).toBeTruthy();
    expect(screen.getByText("Rating: 0.0")).toBeTruthy();
    expect(screen.getByText("No patient data yet.")).toBeTruthy();
  });

  it("does not fetch statistics when the therapist is not authenticated", () => {
    renderDashboard(null);

    expect(api.get).not.toHaveBeenCalled();
  });

  it("toggles dark mode styling and passes dark mode to child widgets", async () => {
    api.get.mockResolvedValue({
      status: 200,
      data: {
        performanceOverview: [],
        recentPatients: [],
      },
    });

    const { container } = renderDashboard();

    await screen.findByText("TherapistProfile light");

    const toggleButton = screen.getByRole("button", { name: "🌙" });
    fireEvent.click(toggleButton);

    expect(container.firstChild.className).toContain("bg-gray-900");
    expect(screen.getByText("TherapistProfile dark")).toBeTruthy();
    expect(screen.getByText("UpcomingAppointments dark")).toBeTruthy();
  });
});
