import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserContext } from "../../../../context/UserContext";
import AppointmentDetails from "./AppointmentDetails";
import api from "../../../../utils/api";
import toast from "react-hot-toast";

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
  default: () => <div>Loading...</div>,
}));

vi.mock("./RescheduleAppointment", () => ({
  default: () => <div>Reschedule modal</div>,
}));

const useAppointmentDetailsPatient =
  (await import("../../../../hooks/useAppointmentDetailsPatient")).default;
const useTherapistDetails =
  (await import("../../../../hooks/useTherapistDetails")).default;

const renderPage = () =>
  render(
    <UserContext.Provider
      value={{ currentUser: { data: { user: { _id: "patient-1" } } } }}
    >
      <AppointmentDetails />
    </UserContext.Provider>
  );

describe("Patient appointment rating flow", () => {
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

  it("shows the rating form for a completed appointment", async () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: {
          _id: "appointment-1",
          therapist: "therapist-1",
          status: "Completed",
          date: "2026-03-20T00:00:00.000Z",
          time: "10:00",
          service: "Rehab",
          purpose: "Follow-up",
        },
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
        data: {
          _id: "appointment-1",
          therapist: "therapist-1",
          status: "Accepted",
          date: "2026-03-20T00:00:00.000Z",
          time: "10:00",
          service: "Rehab",
          purpose: "Follow-up",
        },
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
        data: {
          _id: "appointment-1",
          therapist: "therapist-1",
          status: "Completed",
          date: "2026-03-20T00:00:00.000Z",
          time: "10:00",
          service: "Rehab",
          purpose: "Follow-up",
        },
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
        data: {
          _id: "appointment-1",
          therapist: "therapist-1",
          status: "Completed",
          date: "2026-03-20T00:00:00.000Z",
          time: "10:00",
          service: "Rehab",
          purpose: "Follow-up",
        },
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
        rating: 5,
        review: "Excellent therapist",
      });
    });

    expect(toast.success).toHaveBeenCalledWith("Thank you for your feedback");
    expect(await screen.findByText("Excellent therapist")).toBeTruthy();
  });

  it("shows an existing review instead of the form when the patient already rated the therapist", async () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: {
          _id: "appointment-1",
          therapist: "therapist-1",
          status: "Completed",
          date: "2026-03-20T00:00:00.000Z",
          time: "10:00",
          service: "Rehab",
          purpose: "Follow-up",
        },
      },
    });
    api.get.mockResolvedValue({
      data: {
        therapist: {
          ratings: [
            {
              patient: { _id: "patient-1" },
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

  it("shows payment call-to-action when the appointment is waiting for payment", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: {
          _id: "appointment-1",
          therapist: "therapist-1",
          status: "Waiting for Payment",
          date: "2026-03-20T00:00:00.000Z",
          time: "10:00",
          service: "Rehab",
          purpose: "Follow-up",
        },
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
        data: {
          _id: "appointment-1",
          therapist: "therapist-1",
          status: "Declined",
          date: "2026-03-20T00:00:00.000Z",
          time: "10:00",
          service: "Rehab",
          purpose: "Follow-up",
        },
      },
    });

    renderPage();

    expect(
      screen.getByText("Your appointment has been declined. Please book a new appointment.")
    ).toBeTruthy();
    expect(screen.getByText("Book Appointment")).toBeTruthy();
  });

  it("shows accepted-appointment notes and messaging actions", () => {
    useAppointmentDetailsPatient.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: {
          _id: "appointment-1",
          therapist: "therapist-1",
          status: "Accepted",
          date: "2026-03-20T00:00:00.000Z",
          time: "10:00",
          service: "Rehab",
          purpose: "Follow-up",
        },
      },
    });

    renderPage();

    expect(screen.getByText("Appointment Notes")).toBeTruthy();
    expect(screen.getByText("Add Notes")).toBeTruthy();
    expect(screen.getByText("Message Therapist")).toBeTruthy();
    expect(screen.getByText("Start Chat")).toBeTruthy();
  });
});
