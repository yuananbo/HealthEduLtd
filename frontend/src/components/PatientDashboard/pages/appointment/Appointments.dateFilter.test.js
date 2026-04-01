import { describe, it, expect } from "vitest";
import { matchesLocalCalendarDay } from "./Appointments.jsx";

describe("matchesLocalCalendarDay", () => {
  it("returns true when date filter is empty", () => {
    expect(matchesLocalCalendarDay("2026-03-08T00:00:00.000Z", "")).toBe(true);
  });

  it("returns true when ISO string is missing", () => {
    expect(matchesLocalCalendarDay(undefined, "2026-03-08")).toBe(true);
  });

  it("returns true for malformed date input (not three numeric parts)", () => {
    expect(matchesLocalCalendarDay("2026-03-08T00:00:00.000Z", "bad")).toBe(
      true
    );
  });

  it("matches the appointment local calendar day to YYYY-MM-DD filter", () => {
    const iso = "2026-06-15T12:00:00.000Z";
    const d = new Date(iso);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    expect(matchesLocalCalendarDay(iso, key)).toBe(true);
  });

  it("returns false when filter day does not match local calendar day of ISO", () => {
    const iso = "2026-06-15T12:00:00.000Z";
    expect(matchesLocalCalendarDay(iso, "2020-01-01")).toBe(false);
  });
});
