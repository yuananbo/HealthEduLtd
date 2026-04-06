import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";
import Loading from "../../../utilities/Loading";
import { adminBaseURL } from "../../../../utils/adminApi";

const STATUS_OPTIONS = [
  "all",
  "Pending",
  "Accepted",
  "Declined",
  "Completed",
  "Cancelled",
  "Rescheduled",
  "Waiting for Payment",
];

const QUEUE_OPTIONS = [
  { value: "all", label: "All queues" },
  { value: "needs_payment_follow_up", label: "Needs Payment Follow-up" },
  { value: "awaiting_therapist_action", label: "Awaiting Therapist Action" },
  { value: "reschedule_review", label: "Reschedule Review" },
  { value: "home_care_missing_address", label: "Home-care Missing Address" },
];

const STATUS_STYLES = {
  Pending: "bg-yellow-100 text-yellow-700",
  Accepted: "bg-blue-100 text-blue-700",
  Declined: "bg-red-100 text-red-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-200 text-gray-700",
  Rescheduled: "bg-purple-100 text-purple-700",
  "Waiting for Payment": "bg-orange-100 text-orange-700",
};

const OPERATIONAL_FLAG_LABELS = {
  needs_payment_follow_up: "Needs Payment Follow-up",
  awaiting_therapist_action: "Awaiting Therapist Action",
  reschedule_review: "Reschedule Review",
  home_care_missing_address: "Home-care Missing Address",
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
};

const ACTIVE_STATUS_CARD_STYLES = {
  Pending: "border-yellow-300 bg-yellow-50",
  Accepted: "border-blue-300 bg-blue-50",
  Declined: "border-red-300 bg-red-50",
  Completed: "border-green-300 bg-green-50",
  Cancelled: "border-gray-300 bg-gray-100",
  Rescheduled: "border-purple-300 bg-purple-50",
  "Waiting for Payment": "border-orange-300 bg-orange-50",
};

const ACTIVE_QUEUE_CARD_STYLES = {
  needs_payment_follow_up: "border-orange-300 bg-orange-50",
  awaiting_therapist_action: "border-yellow-300 bg-yellow-50",
  reschedule_review: "border-purple-300 bg-purple-50",
  home_care_missing_address: "border-red-300 bg-red-50",
};

const BOOKING_PANEL_STORAGE_KEY = "admin-booking-panel-state";

const BookingsList = () => {
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    statusCounts: {},
    queueCounts: {},
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    queue: "all",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });
  const [panels, setPanels] = useState(() => {
    if (typeof window === "undefined") {
      return { status: true, queue: true };
    }

    try {
      const saved = window.localStorage.getItem(BOOKING_PANEL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : { status: true, queue: true };
    } catch {
      return { status: true, queue: true };
    }
  });

  const fetchBookings = useCallback(async () => {
    if (!currentUser?.token) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${adminBaseURL}/bookings`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
        params: filters,
      });

      setBookings(response?.data?.data || []);
      setStats(
        response?.data?.stats || { total: 0, statusCounts: {}, queueCounts: {} }
      );
      setPagination(
        response?.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
        }
      );
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token, filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      BOOKING_PANEL_STORAGE_KEY,
      JSON.stringify(panels)
    );
  }, [panels]);

  const handleFilterChange = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const togglePanel = (key) => {
    setPanels((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const activeQueueLabel =
    QUEUE_OPTIONS.find((option) => option.value === filters.queue)?.label ||
    "All queues";

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review all appointment records from the shared booking system.
          </p>
        </div>
        <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Total Bookings
          </p>
          <p className="text-2xl font-bold text-gray-800">
            {stats.total || pagination.totalItems || 0}
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 rounded-lg bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        <input
          type="text"
          aria-label="Search bookings"
          value={filters.search}
          placeholder="Search patient, therapist, service..."
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(event) => handleFilterChange("search", event.target.value)}
        />

        <select
          aria-label="Sort bookings"
          value={filters.sortOrder}
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(event) =>
            handleFilterChange("sortOrder", event.target.value)
          }
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>

        <select
          aria-label="Bookings per page"
          value={filters.limit}
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(event) => handleFilterChange("limit", event.target.value)}
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>

        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Current Filter
          </p>
          <p className="text-sm font-medium text-gray-700">
            {filters.status === "all" ? "All bookings" : filters.status}
            {filters.queue !== "all"
              ? ` • ${QUEUE_OPTIONS.find(
                  (option) => option.value === filters.queue
                )?.label}`
              : ""}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Status Filters</p>
            <p className="text-xs text-gray-500">
              Click a status block to filter the table.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFilterChange("status", "all")}
              className={`rounded-lg border px-3 py-2 text-sm ${
                filters.status === "all"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              All bookings
            </button>
            <button
              type="button"
              onClick={() => togglePanel("status")}
              className="rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {panels.status ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>
        {panels.status ? (
          <div className="overflow-x-auto">
            <div className="grid min-w-[980px] grid-cols-7 gap-3">
              {STATUS_OPTIONS.filter((option) => option !== "all").map(
                (label) => {
                  const isActive = filters.status === label;
                  const count = stats.statusCounts?.[label] || 0;

                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleFilterChange("status", label)}
                      className={`min-w-0 rounded-lg border p-4 text-left shadow-sm transition ${
                        isActive
                          ? ACTIVE_STATUS_CARD_STYLES[label] ||
                            "border-slate-300 bg-slate-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-gray-800">
                        {count}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Status filter:{" "}
            <span className="font-medium text-gray-800">
              {filters.status === "all" ? "All bookings" : filters.status}
            </span>
            {filters.status !== "all"
              ? ` • ${stats.statusCounts?.[filters.status] || 0} matching bookings in the current queue scope`
              : ""}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">Queue Filters</p>
            <p className="text-xs text-gray-500">
              Click a queue block to filter admin follow-up cases.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleFilterChange("queue", "all")}
              className={`rounded-lg border px-3 py-2 text-sm ${
                filters.queue === "all"
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              All queues
            </button>
            <button
              type="button"
              onClick={() => togglePanel("queue")}
              className="rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {panels.queue ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>
        {panels.queue ? (
          <div className="overflow-x-auto">
            <div className="grid min-w-[980px] grid-cols-4 gap-3">
              {QUEUE_OPTIONS.filter((option) => option.value !== "all").map(
                (option) => {
                  const isActive = filters.queue === option.value;
                  const count = stats.queueCounts?.[option.value] || 0;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleFilterChange("queue", option.value)}
                      className={`min-w-0 rounded-lg border p-4 text-left shadow-sm transition ${
                        isActive
                          ? ACTIVE_QUEUE_CARD_STYLES[option.value] ||
                            "border-slate-300 bg-slate-50"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {option.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-gray-800">
                        {count}
                      </p>
                    </button>
                  );
                }
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Queue filter:{" "}
            <span className="font-medium text-gray-800">{activeQueueLabel}</span>
            {filters.queue !== "all"
              ? ` • ${stats.queueCounts?.[filters.queue] || 0} matching bookings in the current status scope`
              : ""}
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-6 py-3">Patient</th>
              <th className="px-6 py-3">Therapist</th>
              <th className="px-6 py-3">Service</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Operations</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-t border-gray-100">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">
                    {booking?.patient?.fullName || "Unknown patient"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking?.patient?.email || "-"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">
                    {booking?.therapist?.fullName || "Unknown therapist"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {booking?.therapist?.email || "-"}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p>{booking.service}</p>
                  <p className="text-xs capitalize text-gray-500">
                    {booking.appointmentType}
                  </p>
                </td>
                <td className="px-6 py-4">{formatDate(booking.date)}</td>
                <td className="px-6 py-4">{booking.time}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {(booking.operationalFlags || []).length > 0 ? (
                      booking.operationalFlags.map((flag) => (
                        <span
                          key={flag}
                          className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                        >
                          {OPERATIONAL_FLAG_LABELS[flag] || flag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No flags</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <Link
                    to={`/admin/bookings/${booking._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {!bookings.length ? (
              <tr>
                <td className="px-6 py-8 text-center text-gray-500" colSpan={8}>
                  No bookings found for the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-gray-600">
          Page {pagination.currentPage} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-md border px-4 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pagination.currentPage <= 1}
            onClick={() => handleFilterChange("page", pagination.currentPage - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-md border px-4 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => handleFilterChange("page", pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingsList;
