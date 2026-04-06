import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";
import BookAppointment from "./BookAppointment";

const postMock = vi.fn();

vi.mock("../../../../utils/api", () => ({
  default: {
    post: (...args) => postMock(...args),
  },
}));

vi.mock("../../../../utils/paymentFlow", () => ({
  getPaymentRedirectUrl: vi.fn(() => null),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../../../hooks/useFech", () => ({
  default: vi.fn(),
}));

vi.mock("../../../common/widgets/Calender", () => ({
  default: function MockCal({ onDateClick }) {
    return (
      <button
        type="button"
        data-testid="mock-pick-date"
        onClick={() => onDateClick("2026-03-10")}
      >
        pick-date
      </button>
    );
  },
}));

vi.mock("../../../common/widgets/TimeSlots", () => ({
  default: function MockSlots({ onTimeSlotSelect }) {
    return (
      <button
        type="button"
        data-testid="mock-pick-slot"
        onClick={() => onTimeSlotSelect({ time: "10:30" })}
      >
        pick-slot
      </button>
    );
  },
}));

vi.mock("../../../features/cards/SmallCard", () => ({
  default: () => <div data-testid="therapist-card">Therapist</div>,
}));

vi.mock("../../../utilities/Loading", () => ({
  default: () => <div data-testid="loading">Loading</div>,
}));

import useDataFetching from "../../../../hooks/useFech";
import toast from "react-hot-toast";
import { getPaymentRedirectUrl } from "../../../../utils/paymentFlow";

const therapistState = {
  id: "ther-1",
  fullName: "Dr Lao",
  specialties: ["PT"],
  profilePicture: "",
  city: "Kigali",
  country: "Rwanda",
  bio: "",
};

const availabilityPayload = {
  status: "success",
  activeAvailability: {
    availabilities: [
      { date: "2026-03-10T00:00:00.000Z", times: [{ time: "10:30" }] },
    ],
  },
};

function renderBook() {
  return render(
    <UserContext.Provider value={{ currentUser: { token: "test-token" } }}>
      <MemoryRouter
        initialEntries={[
          { pathname: "/patient/book", state: { therapist: therapistState } },
        ]}
      >
        <Routes>
          <Route path="/patient/book" element={<BookAppointment />} />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>
  );
}

describe("BookAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postMock.mockReset();
    navigateMock.mockClear();
    useDataFetching.mockReturnValue([
      false,
      null,
      availabilityPayload,
      vi.fn(),
    ]);
  });

  it("shows loading when availability is fetching", () => {
    useDataFetching.mockReturnValue([true, null, null, vi.fn()]);
    renderBook();
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("shows No Availabilities when API returns empty slots", () => {
    useDataFetching.mockReturnValue([
      false,
      null,
      {
        status: "success",
        activeAvailability: { availabilities: [] },
      },
      vi.fn(),
    ]);
    renderBook();
    expect(screen.getByText(/No Availabilities/i)).toBeInTheDocument();
  });

  it("shows validation toast when submitting without date/slot", async () => {
    const user = userEvent.setup();
    renderBook();
    await waitFor(() =>
      expect(screen.getByTestId("mock-pick-date")).toBeInTheDocument()
    );

    await user.type(screen.getByLabelText(/Service/i), "PT");
    await user.type(screen.getByLabelText(/Purpose/i), "Pain");
    await user.click(screen.getByRole("button", { name: /Book & Pay Now/i }));

    expect(toast.error).toHaveBeenCalledWith(
      "Please complete: appointment date, time slot."
    );
    expect(postMock).not.toHaveBeenCalled();
  });

  it("Book & Pay Now posts with paymentDetails and navigates when no redirect", async () => {
    const user = userEvent.setup();
    postMock.mockResolvedValue({
      data: { paymentResponse: { meta: { authorization: {} } } },
    });

    renderBook();
    await waitFor(() =>
      expect(screen.getByTestId("mock-pick-date")).toBeInTheDocument()
    );

    await user.click(screen.getByTestId("mock-pick-date"));
    await user.click(screen.getByTestId("mock-pick-slot"));
    await user.type(screen.getByLabelText(/Service/i), "PT");
    await user.type(screen.getByLabelText(/Purpose/i), "Pain");

    await user.click(screen.getByRole("button", { name: /Book & Pay Now/i }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith(
        "/patient/appointments",
        expect.objectContaining({
          therapist: "ther-1",
          time: "10:30",
          service: "PT",
          purpose: "Pain",
          appointmentType: "in-person",
          paymentDetails: { amount: 5000, currency: "RWF" },
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        })
      );
    });
    expect(getPaymentRedirectUrl).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/patient/payment-success-page");
  });

  it("Add to cart posts without paymentDetails and includes Waiting for Payment status", async () => {
    const user = userEvent.setup();
    postMock.mockResolvedValue({ data: {} });

    renderBook();
    await waitFor(() =>
      expect(screen.getByTestId("mock-pick-date")).toBeInTheDocument()
    );

    await user.click(screen.getByTestId("mock-pick-date"));
    await user.click(screen.getByTestId("mock-pick-slot"));
    await user.type(screen.getByLabelText(/Service/i), "PT");
    await user.type(screen.getByLabelText(/Purpose/i), "Pain");

    await user.click(
      screen.getByRole("button", { name: /Add to cart \(pay later\)/i })
    );

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith(
        "/patient/appointments",
        expect.objectContaining({
          status: "Waiting for Payment",
          therapist: "ther-1",
        }),
        expect.any(Object)
      );
    });
    const body = postMock.mock.calls[0][1];
    expect(body.paymentDetails).toBeUndefined();
    expect(navigateMock).toHaveBeenCalledWith("/patient/appointments");
  });
});
