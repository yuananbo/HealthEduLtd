import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppointmentItem from "./AppointmentItem";

vi.mock("../../../../hooks/useTherapistDetails", () => ({
  default: vi.fn(),
}));

import useTherapistDetails from "../../../../hooks/useTherapistDetails";

const baseAppointment = {
  _id: "appointment-1",
  therapist: {
    _id: "therapist-1",
    firstName: "Aline",
    lastName: "Uwase",
    specialization: "Physiotherapy",
    profilePicture: "/avatar.png",
  },
  date: "2026-03-25T00:00:00.000Z",
  time: "09:00",
  createdAt: "2026-03-20T00:00:00.000Z",
};

function renderRow(appointment) {
  return render(
    <MemoryRouter>
      <table>
        <tbody>
          <AppointmentItem
            appointment={appointment}
            isSelected={false}
            onSelect={() => {}}
          />
        </tbody>
      </table>
    </MemoryRouter>
  );
}

describe("AppointmentItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useTherapistDetails.mockReturnValue({
      loading: false,
      error: null,
      therapist: { data: baseAppointment.therapist },
    });
  });

  it("renders completed appointments with the completed status styling", () => {
    renderRow({ ...baseAppointment, status: "Completed" });

    const badge = screen.getByText("Completed");
    expect(badge.className).toContain("bg-blue-100");
    expect(badge.className).toContain("text-blue-800");
  });

  it("renders rescheduled appointments with the rescheduled status styling", () => {
    renderRow({ ...baseAppointment, status: "Rescheduled" });

    const badge = screen.getByText("Rescheduled");
    expect(badge.className).toContain("bg-purple-100");
    expect(badge.className).toContain("text-purple-800");
  });

  it("renders declined appointments with the declined status styling", () => {
    renderRow({ ...baseAppointment, status: "Declined" });

    const badge = screen.getByText("Declined");
    expect(badge.className).toContain("bg-red-100");
    expect(badge.className).toContain("text-red-800");
  });
});
