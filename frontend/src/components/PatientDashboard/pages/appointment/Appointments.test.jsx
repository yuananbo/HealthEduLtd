import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Appointments from "./Appointments";

vi.mock("../../../../hooks/useFech", () => ({
  default: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("../../../../utils/api", () => ({
  default: {
    patch: vi.fn(),
  },
}));

vi.mock("./AppointmentItem", () => ({
  default: function MockItem({ appointment }) {
    return (
      <tr data-testid={`row-${appointment._id}`}>
        <td>{appointment.status}</td>
        <td>
          <a href={`/patient/appointments/${appointment._id}`}>View details</a>
        </td>
      </tr>
    );
  },
}));

import useDataFetching from "../../../../hooks/useFech";

function renderAppointments() {
  return render(
    <MemoryRouter>
      <Appointments />
    </MemoryRouter>
  );
}

const sampleAppointments = [
  {
    _id: "a1",
    therapist: {
      firstName: "Lao",
      lastName: "Zhongyi",
      specialization: "Medical Doctor",
    },
    status: "Pending",
    createdAt: "2026-03-07T10:00:00.000Z",
    date: "2026-03-10T00:00:00.000Z",
    time: "11:00",
  },
  {
    _id: "a2",
    therapist: {
      firstName: "Other",
      lastName: "Therapist",
      specialization: "PT",
    },
    status: "Cancelled",
    createdAt: "2026-03-07T12:00:00.000Z",
    date: "2026-03-11T00:00:00.000Z",
    time: "09:00",
  },
];

describe("Appointments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state", () => {
    useDataFetching.mockReturnValue([true, null, null, vi.fn()]);
    const { container } = renderAppointments();
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("shows error message", () => {
    useDataFetching.mockReturnValue([false, "Network down", null, vi.fn()]);
    renderAppointments();
    expect(screen.getByText("Network down")).toBeInTheDocument();
  });

  it("renders table rows when data exists", async () => {
    useDataFetching.mockReturnValue([
      false,
      null,
      { data: sampleAppointments },
      vi.fn(),
    ]);
    renderAppointments();
    await waitFor(() => {
      expect(screen.getByTestId("row-a1")).toBeInTheDocument();
      expect(screen.getByTestId("row-a2")).toBeInTheDocument();
    });
    expect(within(screen.getByTestId("row-a1")).getByText("Pending")).toBeInTheDocument();
    expect(within(screen.getByTestId("row-a2")).getByText("Cancelled")).toBeInTheDocument();
  });

  it("keeps search and filters visible when filter yields no rows", async () => {
    const user = userEvent.setup();
    useDataFetching.mockReturnValue([
      false,
      null,
      { data: sampleAppointments },
      vi.fn(),
    ]);
    renderAppointments();
    await waitFor(() => expect(screen.getByTestId("row-a1")).toBeInTheDocument());

    const statusSelect = screen.getByRole("combobox");
    await user.selectOptions(statusSelect, "Completed");

    expect(
      screen.getByPlaceholderText("Search appointments...")
    ).toBeInTheDocument();
    expect(screen.getByText("No appointments found")).toBeInTheDocument();
    expect(
      screen.getByText(/Try adjusting your search or filters/)
    ).toBeInTheDocument();
  });

  it("filters by search term on therapist name", async () => {
    const user = userEvent.setup();
    useDataFetching.mockReturnValue([
      false,
      null,
      { data: sampleAppointments },
      vi.fn(),
    ]);
    renderAppointments();
    await waitFor(() => expect(screen.getByTestId("row-a1")).toBeInTheDocument());

    const search = screen.getByPlaceholderText("Search appointments...");
    await user.type(search, "Other");

    await waitFor(() => {
      expect(screen.queryByTestId("row-a1")).not.toBeInTheDocument();
      expect(screen.getByTestId("row-a2")).toBeInTheDocument();
    });
  });

  it("shows empty-state copy when API returns no appointments", async () => {
    useDataFetching.mockReturnValue([false, null, { data: [] }, vi.fn()]);
    renderAppointments();
    await waitFor(() => {
      expect(screen.getByText("No appointments found")).toBeInTheDocument();
      expect(
        screen.getByText(/Book your first appointment to get started/)
      ).toBeInTheDocument();
    });
  });
});
