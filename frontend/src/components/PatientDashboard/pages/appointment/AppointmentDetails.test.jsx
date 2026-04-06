import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserContext } from "../../../../context/UserContext";
import AppointmentDetails from "./AppointmentDetails";
import api from "../../../../utils/api";
import toast from "react-hot-toast";
import { getPaymentRedirectUrl } from "../../../../utils/paymentFlow";

const navigateMock = vi.fn();

vi.mock("../../../../hooks/useAppointmentDetailsPatient", () => ({
  default: vi.fn(),
}));

vi.mock("../../../../hooks/useTherapistDetails", () => ({
  default: vi.fn(),
}));

vi.mock("../../../../utils/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
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

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
    NavLink: ({ children, ...props }) => <a {...props}>{children}</a>,
    useParams: () => ({ id: "appointment-1" }),
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../../utilities/Loading", () => ({
  default: () => <div data-testid="loading">Loading...</div>,
}));

vi.mock("./RescheduleAppointment", () => ({
  default: () => <div>Reschedule modal</div>,
}));

const useAppointmentDetailsPatient =
  (await import("../../../../hooks/useAppointmentDetailsPatient")).default;
const useTherapistDetails =
  (await import("../../../../hooks/useTherapistDetails")).default;

const baseAppointment = {
  _id: "appointment-1",
  therapist: "therapist-1",
  status: "Pending",
  date: "2026-03-20T00:00:00.000Z",
  time: "10:00",
  service: "Rehab",
  purpose: "Follow-up",
  appointmentType: "in-person",
};

const renderPage = (currentUser = { data: { user: { _id: "patient-1" } } }) =>
  render(
    <UserContext.Provider value={{ currentUser }}>
      <AppointmentDetails />
    </UserContext.Provider>
  );

describe("Patient appointment details", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTherapistDetails.mockReturnValue({
      loading: false,
      error: null,
      therapist: {
        data: {
          firstName: "Jamie",
          lastName: "Chen",
          specialization: "Physiotherapist",
          address: { country: "Canada", city: "Toronto" },
        },
      },
    });
  });

  it("shows loading state", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: true,
      error: null,
      appointment: null,
    });

    renderPage();

    expect(screen.getByTestId("loading")).toBeTruthy();
  });

  it("shows reschedule and cancel actions for a pending appointment", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: { data: baseAppointment },
    });

    renderPage();

    expect(screen.getByRole("button", { name: /Reschedule/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Cancel Appointment/i })).toBeTruthy();
  });

  it("shows the rating form for a completed appointment", async () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Completed" },
      },
    });
    api.get.mockResolvedValue({ data: { therapist: { ratings: [] } } });

    renderPage();

    expect(await screen.findByText("Rate Your Therapist")).toBeTruthy();
    expect(screen.getByText("Submit Review")).toBeTruthy();
  });

  it("does not show the rating form for a non-completed appointment", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Accepted" },
      },
    });

    renderPage();

    expect(screen.queryByText("Rate Your Therapist")).toBeNull();
  });

  it("prevents review submission when no rating is selected", async () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Completed" },
      },
    });
    api.get.mockResolvedValue({ data: { therapist: { ratings: [] } } });

    renderPage();

    fireEvent.click(await screen.findByText("Submit Review"));

    expect(toast.error).toHaveBeenCalledWith(
      "Please select a rating before submitting"
    );
    expect(api.post).not.toHaveBeenCalled();
  });

  it("submits a rating and then shows the saved review", async () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Completed" },
      },
    });
    api.get.mockResolvedValue({ data: { therapist: { ratings: [] } } });
    api.post.mockResolvedValue({
      data: {
        rating: {
          rating: 5,
          review: "Excellent therapist",
          createdAt: "2026-03-22T00:00:00.000Z",
        },
      },
    });

    renderPage();

    const stars = await screen.findAllByLabelText("Select rating star");
    fireEvent.click(stars[4]);
    fireEvent.change(screen.getByLabelText("Review (optional)"), {
      target: { value: "Excellent therapist" },
    });
    fireEvent.click(screen.getByText("Submit Review"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/rating/therapist-1", {
        appointmentId: "appointment-1",
        rating: 5,
        review: "Excellent therapist",
        isAnonymous: false,
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Thank you for your feedback");
    expect(await screen.findByText("Excellent therapist")).toBeTruthy();
  });

  it("submits an anonymous rating when the checkbox is checked", async () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Completed" },
      },
    });
    api.get.mockResolvedValue({ data: { therapist: { ratings: [] } } });
    api.post.mockResolvedValue({
      data: {
        rating: {
          rating: 4,
          review: "Good session",
          isAnonymous: true,
          createdAt: "2026-03-22T00:00:00.000Z",
        },
      },
    });

    renderPage();

    const stars = await screen.findAllByLabelText("Select rating star");
    fireEvent.click(stars[3]);
    fireEvent.change(screen.getByLabelText("Review (optional)"), {
      target: { value: "Good session" },
    });
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: /submit anonymously/i,
      })
    );
    fireEvent.click(screen.getByText("Submit Review"));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/rating/therapist-1", {
        appointmentId: "appointment-1",
        rating: 4,
        review: "Good session",
        isAnonymous: true,
      });
    });
  });

  it("shows an existing review instead of the form when the patient already rated the therapist", async () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Completed" },
      },
    });
    api.get.mockResolvedValue({
      data: {
        therapist: {
          ratings: [
            {
              patient: { _id: "patient-1" },
              appointment: { _id: "appointment-1" },
              rating: 4,
              review: "",
              createdAt: "2026-03-22T00:00:00.000Z",
            },
          ],
        },
      },
    });

    renderPage();

    expect(
      await screen.findByText("You submitted a rating without a written review.")
    ).toBeTruthy();
    expect(screen.queryByText("Submit Review")).toBeNull();
  });

  it("shows anonymous notice when the existing review was submitted anonymously", async () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Completed" },
      },
    });
    api.get.mockResolvedValue({
      data: {
        therapist: {
          ratings: [
            {
              patient: null,
              isAnonymous: true,
              appointment: { _id: "appointment-1" },
              rating: 5,
              review: "Thanks",
              createdAt: "2026-03-22T00:00:00.000Z",
            },
          ],
        },
      },
    });

    renderPage();

    expect(
      await screen.findByText(/submitted this rating anonymously/i)
    ).toBeTruthy();
  });

  it("shows payment call-to-action when the appointment is waiting for payment", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Waiting for Payment" },
      },
    });

    renderPage();

    expect(screen.getByText("Awaiting payment")).toBeTruthy();
    expect(screen.getByText("Go to payment")).toBeTruthy();
  });

  it("shows the rebook prompt when the appointment has been declined", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Declined" },
      },
    });

    renderPage();

    expect(
      screen.getByText("Your appointment has been declined. Please book a new appointment.")
    ).toBeTruthy();
    expect(screen.getByText("Book Appointment")).toBeTruthy();
  });

  it("shows accepted-appointment notes", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Accepted" },
      },
    });

    renderPage();

    expect(screen.getByText("Appointment Notes")).toBeTruthy();
    expect(screen.getByText("Add Notes")).toBeTruthy();
  });

  it("shows pay consultation fee button for completed appointments when fee is unpaid", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Completed", consultationFeePaid: false },
      },
    });
    api.get.mockResolvedValue({ data: { therapist: { ratings: [] } } });

    renderPage();

    expect(screen.getByRole("button", { name: /Pay Consultation Fee/i })).toBeTruthy();
  });

  it("hides pay consultation fee button when consultation fee was already paid", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Completed", consultationFeePaid: true },
      },
    });
    api.get.mockResolvedValue({ data: { therapist: { ratings: [] } } });

    renderPage();

    expect(screen.queryByRole("button", { name: /Pay Consultation Fee/i })).toBeNull();
    expect(screen.getByText(/Consultation fee has been paid/i)).toBeTruthy();
  });

  it("posts consultation payment and navigates to success page when no redirect url is returned", async () => {
    const user = userEvent.setup();
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Completed", consultationFeePaid: false },
      },
    });
    api.get.mockResolvedValue({ data: { therapist: { ratings: [] } } });
    api.post.mockResolvedValueOnce({
      data: { paymentResponse: { meta: { authorization: {} } } },
    });

    renderPage();
    await user.click(screen.getByRole("button", { name: /Pay Consultation Fee/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/patient/appointments/appointment-1/pay-consultation",
        { amount: 5000, currency: "RWF" }
      );
    });

    expect(toast.success).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/patient/payment-success-page");
  });

  it("passes the payment response to getPaymentRedirectUrl after consultation payment", async () => {
    const user = userEvent.setup();
    const paymentResponse = {
      meta: { authorization: { redirect: "https://gateway.example/pay" } },
    };

    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Completed", consultationFeePaid: false },
      },
    });
    api.get.mockResolvedValue({ data: { therapist: { ratings: [] } } });
    api.post.mockResolvedValueOnce({ data: { paymentResponse } });

    renderPage();
    await user.click(screen.getByRole("button", { name: /Pay Consultation Fee/i }));

    await waitFor(() => {
      expect(getPaymentRedirectUrl).toHaveBeenCalledWith(paymentResponse);
    });
  });

  it("shows a toast error when consultation payment fails", async () => {
    const user = userEvent.setup();
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: { ...baseAppointment, status: "Completed", consultationFeePaid: false },
      },
    });
    api.get.mockResolvedValue({ data: { therapist: { ratings: [] } } });
    api.post.mockRejectedValueOnce({
      response: { data: { error: "Already paid" } },
    });

    renderPage();
    await user.click(screen.getByRole("button", { name: /Pay Consultation Fee/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Already paid");
    });
  });
});
