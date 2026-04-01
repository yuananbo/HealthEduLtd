import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import toast from "react-hot-toast";
import TherapistAppointmentDetails from "./AppointmentDetails";

const updateStatusMock = vi.fn();

vi.mock("../../../../hooks/useAppointmentDetails", () => ({
  default: vi.fn(),
}));

vi.mock("../../../../hooks/usePatientDetails", () => ({
  default: vi.fn(),
}));

vi.mock("../../../../hooks/useUpdateAppointmentStatus", () => ({
  default: vi.fn(() => ({
    updateStatus: updateStatusMock,
    loading: false,
  })),
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
    useParams: () => ({ id: "appointment-1" }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock("../../../utilities/Loading", () => ({
  default: () => <div>Loading...</div>,
}));

const useAppointmentDetails =
  (await import("../../../../hooks/useAppointmentDetails")).default;
const usePatientDetails =
  (await import("../../../../hooks/usePatientDetails")).default;

describe("Therapist patient health summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAppointmentDetails.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: {
          _id: "appointment-1",
          patient: "patient-1",
          therapist: "therapist-1",
          status: "Accepted",
          date: "2026-03-20T00:00:00.000Z",
          time: "11:00",
          service: "Home rehab",
          purpose: "Mobility support",
        },
      },
    });

    usePatientDetails.mockReturnValue({
      loading: false,
      error: null,
      patient: {
        data: {
          firstName: "Mia",
          lastName: "Wang",
          patientId: "P100",
          gender: "Female",
          dateOfBirth: "1990-01-01T00:00:00.000Z",
          height: 165,
          weight: 61,
          bloodType: "O+",
          medicalHistory: [{ condition: "Stroke", diagnosedDate: "2025-01-10" }],
          vitals: [{ type: "Blood Pressure", value: "120/80", unit: "mmHg" }],
          medications: [{ name: "Aspirin", dosage: "75mg", frequency: "Daily" }],
          prescriptions: [
            {
              _id: "rx-1",
              originalName: "prescription.pdf",
              uploadedAt: "2026-03-01T00:00:00.000Z",
              url: "https://example.com/prescription.pdf",
            },
          ],
          healthIndicators: {
            recentHistory: [
              {
                _id: "entry-1",
                date: "2026-03-21",
                bloodPressure: { systolic: 120, diastolic: 80 },
                heartRateBpm: 72,
                mood: "Okay",
              },
            ],
          },
        },
      },
      fetchPatientDetails: vi.fn(),
    });
  });

  it("renders the privacy-aware summary without showing email or general address", () => {
    render(<TherapistAppointmentDetails />);

    expect(screen.getByText("Patient Health Summary")).toBeTruthy();
    expect(
      screen.getByText(
        "This view shows patient-entered details that are useful for assessment and treatment planning."
      )
    ).toBeTruthy();
    expect(screen.queryByText(/@/)).toBeNull();
    expect(screen.queryByText("Address")).toBeNull();
  });

  it("allows collapsing and expanding summary sections", () => {
    render(<TherapistAppointmentDetails />);

    expect(screen.getByText("Blood type: O+")).toBeTruthy();
    fireEvent.click(screen.getByText("Profile Details"));
    expect(screen.queryByText("Blood type: O+")).toBeNull();
    fireEvent.click(screen.getByText("Profile Details"));
    expect(screen.getByText("Blood type: O+")).toBeTruthy();
  });

  it("shows home visit address only for home-care appointments", () => {
    useAppointmentDetails.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: {
          _id: "appointment-1",
          patient: "patient-1",
          therapist: "therapist-1",
          status: "Accepted",
          date: "2026-03-20T00:00:00.000Z",
          time: "11:00",
          service: "Home rehab",
          purpose: "Mobility support",
          appointmentType: "home-care",
          homeAddress: {
            street: "12 Lake Road",
            district: "Gasabo",
            city: "Kigali",
            country: "Rwanda",
          },
        },
      },
    });

    render(<TherapistAppointmentDetails />);

    expect(screen.getByText("Home Visit Address")).toBeTruthy();
    expect(screen.getByText("12 Lake Road")).toBeTruthy();
    expect(screen.getByText("Gasabo")).toBeTruthy();
    expect(screen.getByText("Kigali, Rwanda")).toBeTruthy();
  });

  it("shows empty states for health summary categories when patient data is missing", () => {
    usePatientDetails.mockReturnValue({
      loading: false,
      error: null,
      patient: {
        data: {
          firstName: "Mia",
          lastName: "Wang",
          patientId: "P100",
          healthIndicators: {
            recentHistory: [],
          },
          medicalHistory: [],
          vitals: [],
          medications: [],
          prescriptions: [],
        },
      },
      fetchPatientDetails: vi.fn(),
    });

    render(<TherapistAppointmentDetails />);

    expect(screen.getByText("No recent check-in history recorded yet.")).toBeTruthy();
    fireEvent.click(screen.getByText("Medical History"));
    expect(
      screen.getByText("No medical history recorded in the patient profile.")
    ).toBeTruthy();
    fireEvent.click(screen.getByText("Vitals"));
    expect(screen.getByText("No vitals recorded in the patient profile.")).toBeTruthy();
    fireEvent.click(screen.getByText("Current Medications"));
    expect(
      screen.getByText("No medications recorded in the patient profile.")
    ).toBeTruthy();
    fireEvent.click(screen.getByText("Uploaded Prescriptions"));
    expect(
      screen.getByText("No prescriptions uploaded by the patient.")
    ).toBeTruthy();
  });

  it("shows the decline confirmation before declining a pending appointment", () => {
    useAppointmentDetails.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: {
          _id: "appointment-1",
          patient: "patient-1",
          therapist: "therapist-1",
          status: "Pending",
          date: "2026-03-20T00:00:00.000Z",
          time: "11:00",
          service: "Home rehab",
          purpose: "Mobility support",
        },
      },
    });

    render(<TherapistAppointmentDetails />);

    fireEvent.click(screen.getByText("Decline"));

    expect(screen.getByText("Are you sure?")).toBeTruthy();
    expect(screen.getByText("Yes, Decline")).toBeTruthy();
  });

  it("validates note inputs before adding a note on accepted appointments", () => {
    useAppointmentDetails.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: {
          _id: "appointment-1",
          patient: "patient-1",
          therapist: "therapist-1",
          status: "Accepted",
          date: "2026-03-20T00:00:00.000Z",
          time: "11:00",
          service: "Home rehab",
          purpose: "Mobility support",
          sessionNotes: [],
        },
      },
    });

    render(<TherapistAppointmentDetails />);

    fireEvent.click(screen.getByRole("button", { name: "Add Note" }));

    expect(toast.error).toHaveBeenCalledWith("Please fill in all fields");
  });

  it("marks accepted appointments as complete", async () => {
    updateStatusMock.mockResolvedValueOnce({});

    useAppointmentDetails.mockReturnValue({
      loading: false,
      error: null,
      appointment: {
        data: {
          _id: "appointment-1",
          patient: "patient-1",
          therapist: "therapist-1",
          status: "Accepted",
          date: "2026-03-20T00:00:00.000Z",
          time: "11:00",
          service: "Home rehab",
          purpose: "Mobility support",
          sessionNotes: [],
        },
      },
    });

    render(<TherapistAppointmentDetails />);

    fireEvent.click(screen.getByText("Mark as Complete"));

    expect(updateStatusMock).toHaveBeenCalledWith("appointment-1", "Completed");
  });
});
