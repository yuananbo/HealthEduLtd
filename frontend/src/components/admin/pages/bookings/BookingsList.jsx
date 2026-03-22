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

const STATUS_STYLES = {
  Pending: "bg-yellow-100 text-yellow-700",
  Accepted: "bg-blue-100 text-blue-700",
  Declined: "bg-red-100 text-red-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-gray-200 text-gray-700",
  Rescheduled: "bg-purple-100 text-purple-700",
  "Waiting for Payment": "bg-orange-100 text-orange-700",
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString();
};

const BookingsList = () => {
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    statusCounts: {},
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
    sortOrder: "desc",
    page: 1,
    limit: 10,
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
      setStats(response?.data?.stats || { total: 0, statusCounts: {} });
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

  const handleFilterChange = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

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
          aria-label="Filter by booking status"
          value={filters.status}
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(event) => handleFilterChange("status", event.target.value)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All statuses" : option}
            </option>
          ))}
        </select>

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
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Object.entries(stats.statusCounts || {}).map(([label, count]) => (
          <div key={label} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-800">{count}</p>
          </div>
        ))}
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
                <td className="px-6 py-8 text-center text-gray-500" colSpan={7}>
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
