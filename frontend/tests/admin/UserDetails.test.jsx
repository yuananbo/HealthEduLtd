import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { UserContext } from "../../src/context/UserContext";
import UserDetails from "../../src/components/admin/pages/users/UserDetails";

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

const therapistPayload = {
  id: "therapist-1",
  userType: "therapist",
  fullName: "Jamie Chen",
  basicInfo: {
    firstName: "Jamie",
    lastName: "Chen",
    email: "jamie@example.com",
    phoneNumber: "111222333",
    alternativePhoneNumber: "",
    address: { city: "Toronto", country: "Canada" },
    userType: "therapist",
  },
  accountInfo: {
    status: "pending",
    isActive: true,
    isVerified: false,
    createdAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-05T00:00:00.000Z",
    lastLoginAt: null,
  },
  businessInfo: {
    therapistId: "T100",
    profession: "PT",
    specialization: "Physio",
    numOfYearsOfExperience: 6,
    appointmentCount: 14,
    documentUploadStatus: {
      hasProfilePicture: true,
      hasCv: true,
      hasLicenseDocument: false,
    },
  },
};

const renderWithUser = () =>
  render(
    <UserContext.Provider
      value={{
        currentUser: { token: "admin-token" },
        loading: false,
      }}
    >
      <MemoryRouter initialEntries={["/admin/users/therapist-1?userType=therapist"]}>
        <Routes>
          <Route path="/admin/users/:id" element={<UserDetails />} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>
  );

describe("UserDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a user detail payload from the admin api", async () => {
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: { data: therapistPayload },
    });

    renderWithUser();

    expect(await screen.findByText("Jamie Chen")).toBeInTheDocument();
    expect(screen.getAllByText("pending").length).toBeGreaterThan(0);
    expect(screen.getByText("Basic Info")).toBeInTheDocument();
    expect(screen.getByText("Business Info")).toBeInTheDocument();
    expect(screen.getByText("Physio")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/users/therapist-1"),
      expect.objectContaining({
        params: { userType: "therapist" },
      })
    );
  });

  it("shows an empty state when no user can be loaded", async () => {
    axios.get.mockResolvedValueOnce({
      status: 200,
      data: { data: null },
    });

    renderWithUser();

    expect(
      await screen.findByText("User details could not be loaded.")
    ).toBeInTheDocument();
    expect(screen.getByText("Back to Users")).toBeInTheDocument();
  });

  it("updates user status and refetches the details", async () => {
    axios.get
      .mockResolvedValueOnce({
        status: 200,
        data: { data: therapistPayload },
      })
      .mockResolvedValueOnce({
        status: 200,
        data: {
          data: {
            ...therapistPayload,
            accountInfo: { ...therapistPayload.accountInfo, status: "active" },
          },
        },
      });
    axios.patch.mockResolvedValueOnce({ status: 200, data: { success: true } });

    renderWithUser();

    await screen.findByText("Approve");
    await userEvent.click(screen.getByText("Approve"));

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/users/therapist-1/status"),
        { userType: "therapist", status: "active" },
        expect.any(Object)
      )
    );
    expect(toast.success).toHaveBeenCalledWith("User status updated");
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));
  });
});
