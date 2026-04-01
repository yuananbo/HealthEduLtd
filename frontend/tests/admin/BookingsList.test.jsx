import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../src/context/UserContext";
import BookingsList from "../../src/components/admin/pages/bookings/BookingsList";

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

const renderWithUser = (ui) =>
  render(
    <UserContext.Provider
      value={{
        currentUser: { token: "test-token" },
        loading: false,
      }}
    >
      <MemoryRouter>{ui}</MemoryRouter>
    </UserContext.Provider>
  );

describe("BookingsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders fetched bookings and stats", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            _id: "booking-1",
            patient: { fullName: "Jane Patient", email: "jane@example.com" },
            therapist: { fullName: "Tom Therapist", email: "tom@example.com" },
            service: "Physiotherapy",
            appointmentType: "in-person",
            date: "2026-03-20T00:00:00.000Z",
            time: "10:00 AM",
            status: "Pending",
          },
        ],
        stats: {
          total: 1,
          statusCounts: { Pending: 1, Accepted: 0 },
        },
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
        },
      },
    });

    renderWithUser(<BookingsList />);

    expect(await screen.findByText("Jane Patient")).toBeInTheDocument();
    expect(screen.getByText("Physiotherapy")).toBeInTheDocument();
    expect(screen.getByText("Total Bookings")).toBeInTheDocument();
    expect(screen.getByText("View Details")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/bookings"),
      expect.objectContaining({
        params: expect.objectContaining({
          search: "",
          status: "all",
          sortOrder: "desc",
          page: 1,
          limit: 10,
        }),
      })
    );
  });

  it("refetches when the user changes filters", async () => {
    axios.get
      .mockResolvedValueOnce({
        data: {
          data: [],
          stats: { total: 0, statusCounts: {} },
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [],
          stats: { total: 0, statusCounts: {} },
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 10,
          },
        },
      });

    renderWithUser(<BookingsList />);

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    await userEvent.selectOptions(
      screen.getByLabelText("Filter by booking status"),
      "Pending"
    );

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    expect(axios.get.mock.calls[1][1].params.status).toBe("Pending");
    expect(screen.getByLabelText("Filter by booking status")).toHaveValue(
      "Pending"
    );
  });
});
