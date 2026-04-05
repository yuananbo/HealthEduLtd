import axios from "axios";
import PropTypes from "prop-types";
import { useCallback, useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { UserContext } from "../../../../context/UserContext";
import Loading from "../../../utilities/Loading";
import { adminBaseURL } from "../../../../utils/adminApi";

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

const VALID_TRANSITIONS = {
  "Waiting for Payment": ["Pending", "Cancelled"],
  Pending: ["Accepted", "Declined", "Cancelled"],
  Rescheduled: ["Accepted", "Declined", "Cancelled"],
  Accepted: ["Completed", "Cancelled"],
  Declined: [],
  Completed: [],
  Cancelled: [],
};

const DetailRow = ({ label, value }) => (
  <div className="border-b border-gray-100 py-3">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-800">{value || "-"}</p>
  </div>
);

DetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

DetailRow.defaultProps = {
  value: "-",
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
};

const BookingDetails = () => {
  const { id } = useParams();
  const { currentUser } = useContext(UserContext);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [error, setError] = useState("");

  const fetchBooking = useCallback(async () => {
    if (!currentUser?.token || !id) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${adminBaseURL}/bookings/${id}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
      });

      setBooking(response?.data?.data || null);
      setSelectedStatus(response?.data?.data?.status || "");
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || fetchError.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token, id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === booking?.status) {
      return;
    }

    setStatusUpdating(true);
    try {
      const response = await axios.patch(
        `${adminBaseURL}/bookings/${id}`,
        {
          status: selectedStatus,
          reason: statusReason,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBooking(response?.data?.data || null);
      setSelectedStatus(response?.data?.data?.status || selectedStatus);
      setStatusReason("");
      toast.success("Booking status updated");
      fetchBooking();
    } catch (updateError) {
      toast.error(
        updateError?.response?.data?.message || "Failed to update booking status"
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-gray-600">Booking details could not be loaded.</p>
        <Link to="/admin/bookings" className="mt-4 inline-block text-blue-600">
          Back to Bookings
        </Link>
      </div>
    );
  }

  const address = [
    booking?.homeAddress?.street,
    booking?.homeAddress?.district,
    booking?.homeAddress?.city,
    booking?.homeAddress?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const history = [...(booking.statusHistory || [])].sort(
    (left, right) => new Date(right.changedAt) - new Date(left.changedAt)
  );
  const nextStatusOptions = [
    booking.status,
    ...(VALID_TRANSITIONS[booking.status] || []),
  ];
  const canUpdateStatus = nextStatusOptions.length > 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Link to="/admin/bookings" className="text-sm text-blue-600">
            Back to Bookings
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-800">
            Booking Details
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Appointment record ID: {booking._id}
          </p>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-sm ${
            STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {booking.status}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Booking Overview
          </h2>
          <DetailRow label="Service Type" value={booking.service} />
          <DetailRow label="Appointment Type" value={booking.appointmentType} />
          <DetailRow
            label="Appointment Date"
            value={booking.date ? new Date(booking.date).toLocaleDateString() : "-"}
          />
          <DetailRow label="Appointment Time" value={booking.time} />
          <DetailRow label="Current Status" value={booking.status} />
          <DetailRow label="Purpose" value={booking.purpose} />
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Patient</h2>
          <DetailRow
            label="Full Name"
            value={`${booking?.patient?.firstName || ""} ${booking?.patient?.lastName || ""}`.trim()}
          />
          <DetailRow label="Email" value={booking?.patient?.email} />
          <DetailRow label="Phone Number" value={booking?.patient?.phoneNumber} />
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Therapist
          </h2>
          <DetailRow
            label="Full Name"
            value={`${booking?.therapist?.firstName || ""} ${booking?.therapist?.lastName || ""}`.trim()}
          />
          <DetailRow label="Email" value={booking?.therapist?.email} />
          <DetailRow
            label="Phone Number"
            value={booking?.therapist?.phoneNumber}
          />
          <DetailRow
            label="Specialization"
            value={booking?.therapist?.specialization}
          />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Manage Status
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="booking-status"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Booking Status
              </label>
              <select
                id="booking-status"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                disabled={!canUpdateStatus}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {nextStatusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="booking-status-reason"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Change Reason
              </label>
              <textarea
                id="booking-status-reason"
                rows="3"
                value={statusReason}
                onChange={(event) => setStatusReason(event.target.value)}
                disabled={!canUpdateStatus}
                className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional note for the audit history"
              />
            </div>
            {!canUpdateStatus ? (
              <p className="text-sm text-gray-500">
                This booking is already in a terminal state and cannot be changed.
              </p>
            ) : null}
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={
                statusUpdating ||
                !canUpdateStatus ||
                !selectedStatus ||
                selectedStatus === booking.status
              }
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {statusUpdating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Booking History
          </h2>
          <DetailRow label="Created At" value={formatDateTime(booking.createdAt)} />
          <DetailRow label="Last Updated" value={formatDateTime(booking.updatedAt)} />
          <DetailRow label="Current State" value={booking.status} />
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Operations Summary
          </h2>
          <div className="flex flex-wrap gap-2">
            {(booking.operationalFlags || []).length > 0 ? (
              booking.operationalFlags.map((flag) => (
                <span
                  key={flag}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                >
                  {OPERATIONAL_FLAG_LABELS[flag] || flag}
                </span>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No operational follow-up flags for this booking.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Notes and Location
          </h2>
          <DetailRow label="Admin/Booking Notes" value={booking.notes} />
          <DetailRow label="Home-care Address" value={address} />
        </section>
      </div>

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Status Timeline
        </h2>
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div
              key={`${entry.status}-${entry.changedAt || index}`}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      STATUS_STYLES[entry.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {entry.status}
                  </span>
                  <p className="text-sm text-gray-700">
                    {entry.fromStatus ? `From ${entry.fromStatus}` : "Initial status"}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {formatDateTime(entry.changedAt)}
                </p>
              </div>
              <p className="mt-2 text-sm text-gray-700">
                Actor: {entry?.changedBy?.name || "System"} (
                {entry?.changedBy?.userType || "system"})
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Source: {entry.source || "system"}
              </p>
              {entry.reason ? (
                <p className="mt-1 text-sm text-gray-600">Reason: {entry.reason}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BookingDetails;
