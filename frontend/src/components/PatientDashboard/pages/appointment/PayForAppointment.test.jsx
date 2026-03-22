import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";
import PayForAppointment from "./PayForAppointment";

const postMock = vi.fn();

vi.mock("../../../../utils/api", () => ({
  default: {
    post: (...args) => postMock(...args),
  },
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

vi.mock("../../../../hooks/useAppointmentDetailsPatient", () => ({
  default: vi.fn(),
}));

vi.mock("../../../../hooks/useTherapistDetails", () => ({
  default: vi.fn(),
}));

import useAppointmentDetailsPatient from "../../../../hooks/useAppointmentDetailsPatient";
import useTherapistDetails from "../../../../hooks/useTherapistDetails";
import toast from "react-hot-toast";

function renderPay() {
  return render(
    <UserContext.Provider value={{ currentUser: { token: "test-token" } }}>
      <MemoryRouter initialEntries={["/patient/appointments/apt-1/pay"]}>
        <Routes>
          <Route
            path="/patient/appointments/:id/pay"
            element={<PayForAppointment />}
          />
        </Routes>
      </MemoryRouter>
    </UserContext.Provider>
  );
}

describe("PayForAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockClear();
    postMock.mockReset();
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: null,
      loading: true,
      error: null,
    });
    useTherapistDetails.mockReturnValue({
      loading: false,
      therapist: null,
    });
  });

  it("shows loading while appointment is loading", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: null,
      loading: true,
      error: null,
    });
    const { container } = renderPay();
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("shows error state with link back to appointments", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: null,
      loading: false,
      error: "Failed to load",
    });
    renderPay();
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to appointments/i })).toHaveAttribute(
      "href",
      "/patient/appointments"
    );
  });

  it("shows message when appointment is not awaiting payment", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: {
        data: {
          therapist: "t1",
          status: "Pending",
          service: "PT",
          date: "2025-06-01",
          time: "09:00",
        },
      },
      loading: false,
      error: null,
    });
    useTherapistDetails.mockReturnValue({
      loading: false,
      therapist: { data: { firstName: "A", lastName: "B" } },
    });
    renderPay();
    expect(
      screen.getByText(/not awaiting payment/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View appointment details/i })).toHaveAttribute(
      "href",
      "/patient/appointments/apt-1"
    );
  });

  it("submits pay, shows toast and navigates when no gateway redirect", async () => {
    const user = userEvent.setup();
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: {
        data: {
          therapist: "t1",
          status: "Waiting for Payment",
          service: "PT",
          date: "2025-06-01",
          time: "09:00",
        },
      },
      loading: false,
      error: null,
    });
    useTherapistDetails.mockReturnValue({
      loading: false,
      therapist: { data: { firstName: "A", lastName: "B" } },
    });
    postMock.mockResolvedValue({
      data: { paymentResponse: { meta: { authorization: {} } } },
    });

    renderPay();

    await user.click(screen.getByRole("button", { name: /Pay now/i }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith(
        "/patient/appointments/apt-1/pay",
        { amount: 5000, currency: "RWF" },
        expect.objectContaining({
          headers: { Authorization: "Bearer test-token" },
        })
      );
    });

    expect(toast.success).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/patient/payment-success-page");
  });

  it("shows toast error when pay API fails", async () => {
    const user = userEvent.setup();
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: {
        data: {
          therapist: "t1",
          status: "Waiting for Payment",
          service: "PT",
          date: "2025-06-01",
          time: "09:00",
        },
      },
      loading: false,
      error: null,
    });
    useTherapistDetails.mockReturnValue({
      loading: false,
      therapist: { data: { firstName: "A", lastName: "B" } },
    });
    postMock.mockRejectedValue({
      response: { data: { error: "Payment service down" } },
    });

    renderPay();
    await user.click(screen.getByRole("button", { name: /Pay now/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Payment service down");
    });
  });
});
