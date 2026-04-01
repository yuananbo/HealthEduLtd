import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../../src/context/UserContext";
import BookingDetails from "../../src/components/admin/pages/bookings/BookingDetails";

vi.mock("axios", () => {
  const create = () => ({
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  });

  return {
    default: {
      get: vi.fn(),
      patch: vi.fn(),
      post: vi.fn(),
      create,
    },
  };
});
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const bookingPayload = {
  _id: "booking-1",
  status: "Pending",
  service: "Physiotherapy",
  appointmentType: "in-person",
  date: "2026-03-20T00:00:00.000Z",
  time: "10:00 AM",
  purpose: "Rehab review",
  createdAt: "2026-03-19T10:00:00.000Z",
  updatedAt: "2026-03-19T11:00:00.000Z",
  notes: "Needs wheelchair access",
  patient: {
    firstName: "Jane",
    lastName: "Patient",
    email: "jane@example.com",
    phoneNumber: "111-222-3333",
  },
  therapist: {
    firstName: "Tom",
    lastName: "Therapist",
    email: "tom@example.com",
    phoneNumber: "444-555-6666",
    specialization: "Physio",
  },
  statusHistory: [
    {
      status: "Pending",
      fromStatus: "",
      changedAt: "2026-03-19T10:00:00.000Z",
      source: "booking-created",
      reason: "Appointment created",
      changedBy: {
        name: "Jane Patient",
        userType: "patient",
      },
    },
  ],
};

const renderWithUser = () =>
  render(
    <UserContext.Provider
      value={{
        currentUser: { token: "test-token" },
        loading: false,
      }}
    >
      <MemoryRouter initialEntries={["/admin/bookings/booking-1"]}>
        <Routes>
          <Route path="/admin/bookings/:id" element={<BookingDetails />} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>
  );

describe("BookingDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders booking details and status timeline", async () => {
    axios.get.mockResolvedValueOnce({
      data: { data: bookingPayload },
    });

    renderWithUser();

    expect(await screen.findByText("Booking Details")).toBeInTheDocument();
    expect(screen.getByText("Physiotherapy")).toBeInTheDocument();
    expect(screen.getByText("Jane Patient")).toBeInTheDocument();
    expect(screen.getByText("Tom Therapist")).toBeInTheDocument();
    expect(screen.getByText("Status Timeline")).toBeInTheDocument();
    expect(screen.getByText("Initial status")).toBeInTheDocument();
    expect(screen.getByText(/Actor: Jane Patient/)).toBeInTheDocument();
  });

  it("updates booking status after admin interaction", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: { data: bookingPayload },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            ...bookingPayload,
            status: "Accepted",
            statusHistory: [
              {
                status: "Accepted",
                fromStatus: "Pending",
                changedAt: "2026-03-19T12:00:00.000Z",
                source: "admin-action",
                reason: "Approved by admin",
                changedBy: {
                  name: "Admin User",
                  userType: "admin",
                },
              },
              ...bookingPayload.statusHistory,
            ],
          },
        },
      });

    axios.patch.mockResolvedValueOnce({
      data: {
        data: {
          ...bookingPayload,
          status: "Accepted",
        },
      },
    });

    renderWithUser();

    expect(await screen.findByText("Booking Details")).toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getByLabelText("Booking Status"),
      "Accepted"
    );
    await userEvent.type(
      screen.getByLabelText("Change Reason"),
      "Approved by admin"
    );
    await userEvent.click(screen.getByRole("button", { name: "Update Status" }));

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/bookings/booking-1"),
        {
          status: "Accepted",
          reason: "Approved by admin",
        },
        expect.any(Object)
      )
    );

    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
  });
});
