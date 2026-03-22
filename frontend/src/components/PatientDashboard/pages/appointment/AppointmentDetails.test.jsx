import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AppointmentDetails from "./AppointmentDetails";

const postMock = vi.fn();
const patchMock = vi.fn();

vi.mock("../../../../utils/api", () => ({
  default: {
    post: (...args) => postMock(...args),
    patch: (...args) => patchMock(...args),
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

vi.mock("../../../../hooks/useAppointmentDetailsPatient", () => ({
  default: vi.fn(),
}));

vi.mock("../../../../hooks/useTherapistDetails", () => ({
  default: vi.fn(),
}));

vi.mock("./RescheduleAppointment", () => ({
  default: () => null,
}));

vi.mock("../../../utilities/Loading", () => ({
  default: () => <div data-testid="loading">Loading</div>,
}));

import useAppointmentDetailsPatient from "../../../../hooks/useAppointmentDetailsPatient";
import useTherapistDetails from "../../../../hooks/useTherapistDetails";
import toast from "react-hot-toast";
import { getPaymentRedirectUrl } from "../../../../utils/paymentFlow";

function renderDetails(id = "apt-1") {
  return render(
    <MemoryRouter initialEntries={[`/patient/appointments/${id}`]}>
      <Routes>
        <Route
          path="/patient/appointments/:id"
          element={<AppointmentDetails />}
        />
      </Routes>
    </MemoryRouter>
  );
}

const baseAppointment = {
  therapist: "t1",
  status: "Pending",
  service: "PT",
  purpose: "Check",
  date: "2026-03-10T00:00:00.000Z",
  time: "11:00",
  appointmentType: "in-person",
};

describe("AppointmentDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    postMock.mockReset();
    patchMock.mockReset();
    navigateMock.mockClear();
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: { data: baseAppointment },
      loading: false,
      error: null,
    });
    useTherapistDetails.mockReturnValue({
      loading: false,
      error: null,
      therapist: {
        data: {
          firstName: "Lao",
          lastName: "Zhongyi",
          specialization: "Medical Doctor",
          address: { country: "Rwanda", city: "Kigali" },
        },
      },
    });
  });

  it("shows loading", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: null,
      loading: true,
      error: null,
    });
    renderDetails();
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("shows Reschedule and Cancel for Pending status", () => {
    renderDetails();
    expect(screen.getByRole("button", { name: /Reschedule/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Cancel Appointment/i })
    ).toBeInTheDocument();
  });

  it("does not show Reschedule/Cancel for Completed; shows Pay Consultation Fee", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: {
        data: { ...baseAppointment, status: "Completed", consultationFeePaid: false },
      },
      loading: false,
      error: null,
    });
    renderDetails();
    expect(
      screen.queryByRole("button", { name: /Reschedule/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Cancel Appointment/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Pay Consultation Fee/i })
    ).toBeInTheDocument();
  });

  it("hides Pay Consultation Fee when consultationFeePaid", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: {
        data: { ...baseAppointment, status: "Completed", consultationFeePaid: true },
      },
      loading: false,
      error: null,
    });
    renderDetails();
    expect(
      screen.queryByRole("button", { name: /Pay Consultation Fee/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Consultation fee has been paid/)
    ).toBeInTheDocument();
  });

  it("posts pay-consultation and navigates on success without redirect URL", async () => {
    const user = userEvent.setup();
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: {
        data: { ...baseAppointment, status: "Completed", consultationFeePaid: false },
      },
      loading: false,
      error: null,
    });
    postMock.mockResolvedValue({
      data: { paymentResponse: { meta: { authorization: {} } } },
    });

    renderDetails("apt-99");
    await user.click(screen.getByRole("button", { name: /Pay Consultation Fee/i }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith(
        "/patient/appointments/apt-99/pay-consultation",
        { amount: 5000, currency: "RWF" }
      );
    });
    expect(toast.success).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/patient/payment-success-page");
  });

  it("calls getPaymentRedirectUrl with payment response after pay-consultation", async () => {
    const user = userEvent.setup();
    const pr = {
      meta: { authorization: { redirect: "https://gateway.example/pay" } },
    };
    postMock.mockResolvedValue({ data: { paymentResponse: pr } });

    useAppointmentDetailsPatient.mockReturnValue({
      appointment: {
        data: { ...baseAppointment, status: "Completed", consultationFeePaid: false },
      },
      loading: false,
      error: null,
    });

    renderDetails();
    await user.click(screen.getByRole("button", { name: /Pay Consultation Fee/i }));

    await waitFor(() => {
      expect(getPaymentRedirectUrl).toHaveBeenCalledWith(pr);
    });
  });

  it("shows Go to payment link when Waiting for Payment", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: {
        data: { ...baseAppointment, status: "Waiting for Payment" },
      },
      loading: false,
      error: null,
    });
    renderDetails("wait-pay-1");
    const link = screen.getByRole("link", { name: /Go to payment/i });
    expect(link).toHaveAttribute("href", "/patient/appointments/wait-pay-1/pay");
  });

  it("shows toast error when pay-consultation fails", async () => {
    const user = userEvent.setup();
    useAppointmentDetailsPatient.mockReturnValue({
      appointment: {
        data: { ...baseAppointment, status: "Completed", consultationFeePaid: false },
      },
      loading: false,
      error: null,
    });
    postMock.mockRejectedValue({
      response: { data: { error: "Already paid" } },
    });

    renderDetails();
    await user.click(screen.getByRole("button", { name: /Pay Consultation Fee/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Already paid");
    });
  });
});
