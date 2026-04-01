import moment from "moment";

/** Local calendar day from date picker (wall date, no UTC shift). */
export function localCalendarDateToYmd(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * API returns ISO instants (UTC midnight for a calendar day) or YYYY-MM-DD.
 * Normalize to YYYY-MM-DD for consistent display and requests.
 */
export function coerceApiDateToYmd(value) {
  if (value == null || value === "") return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  const m = moment.utc(value);
  if (!m.isValid()) return "";
  return m.format("YYYY-MM-DD");
}

export function formatAvailabilityDateLabel(value) {
  const ymd = coerceApiDateToYmd(value);
  if (!ymd) return "";
  return moment.utc(ymd, "YYYY-MM-DD", true).format("MMMM Do, YYYY");
}

/** Local Date for calendar modifiers (highlight correct grid cell). */
export function ymdToLocalDate(ymd) {
  if (!ymd || typeof ymd !== "string") return null;
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
