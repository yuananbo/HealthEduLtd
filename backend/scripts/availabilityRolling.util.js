/**
 * Mock availability: 7 consecutive calendar days starting today (UTC date-only),
 * so running seed/refresh always gives future bookable dates for local + payment testing.
 */
import moment from "moment";

const DEFAULT_TIMES = ["09:00", "10:00", "11:00", "14:00", "15:00"];

export function buildRolling7DayAvailabilitiesUTC(times = DEFAULT_TIMES) {
  const start = moment.utc().startOf("day");
  return Array.from({ length: 7 }).map((_, i) => ({
    date: start.clone().add(i, "day").toDate(),
    times: times.map((t) => ({ time: t, isActive: true })),
  }));
}
