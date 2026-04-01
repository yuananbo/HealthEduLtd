import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../../src/context/UserContext";
import AllUsers from "../../src/components/admin/pages/users/AllUsers";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../../src/components/utilities/Loading", () => ({
  default: () => <div>Loading...</div>,
}));

const renderWithUser = () =>
  render(
    <UserContext.Provider
      value={{
        currentUser: { token: "admin-token" },
        loading: false,
      }}
    >
      <MemoryRouter>
        <AllUsers />
      </MemoryRouter>
    </UserContext.Provider>
  );

describe("AllUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders fetched users and summary stats", async () => {
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: {
        data: [
          {
            id: "user-1",
            name: "Mia Wang",
            email: "mia@example.com",
            phoneNumber: "123456789",
            userType: "patient",
            status: "active",
            createdAt: "2026-03-01T00:00:00.000Z",
            lastLoginAt: "2026-03-20T10:30:00.000Z",
          },
        ],
        total: 1,
        currentPage: 1,
        totalPages: 1,
      },
    });

    renderWithUser();

    expect(await screen.findByText("Mia Wang")).toBeInTheDocument();
    expect(screen.getByText("mia@example.com")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("View Details")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/users"),
      expect.objectContaining({
        params: expect.objectContaining({
          search: "",
          userType: "all",
          status: "all",
          sortBy: "createdAt",
          sortOrder: "desc",
          page: 1,
          limit: 10,
        }),
      })
    );
  });

  it("refetches when filters change", async () => {
    axios.get
      .mockResolvedValueOnce({
        status: 200,
        data: { data: [], total: 0, currentPage: 1, totalPages: 1 },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: { data: [], total: 0, currentPage: 1, totalPages: 1 },
      });

    renderWithUser();

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    await userEvent.selectOptions(screen.getByDisplayValue("All user types"), "therapist");

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
    expect(axios.get.mock.calls[1][1].params.userType).toBe("therapist");
  });

  it("updates a user status and refetches the list", async () => {
    axios.get
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: [
            {
              id: "user-1",
              name: "Mia Wang",
              email: "mia@example.com",
              phoneNumber: "123456789",
              userType: "patient",
              status: "active",
              createdAt: "2026-03-01T00:00:00.000Z",
              lastLoginAt: null,
            },
          ],
          total: 1,
          currentPage: 1,
          totalPages: 1,
        },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: [
            {
              id: "user-1",
              name: "Mia Wang",
              email: "mia@example.com",
              phoneNumber: "123456789",
              userType: "patient",
              status: "inactive",
              createdAt: "2026-03-01T00:00:00.000Z",
              lastLoginAt: null,
            },
          ],
          total: 1,
          currentPage: 1,
          totalPages: 1,
        },
      });
    axios.patch.mockResolvedValueOnce({ status: 200, data: { success: true } });

    renderWithUser();

    await screen.findByText("Deactivate");
    await userEvent.click(screen.getByText("Deactivate"));

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/users/user-1/status"),
        { userType: "patient", status: "inactive" },
        expect.any(Object)
      )
    );
    expect(toast.success).toHaveBeenCalledWith("User status updated");
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
  });
});
