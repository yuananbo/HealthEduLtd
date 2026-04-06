import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserContext } from "../../../../context/UserContext";
import Loading from "../../../utilities/Loading";
import { adminBaseURL } from "../../../../utils/adminApi";

const AppointmentsTab = ({ therapistId }) => {
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ totalAppointments: 0, statusCounts: {} });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!currentUser?.token || !therapistId) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `${adminBaseURL}/therapists/${therapistId}/appointments`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setAppointments(response?.data?.data?.appointments || []);
        setStats(
          response?.data?.data?.stats || {
            totalAppointments: 0,
            statusCounts: {},
          }
        );
        setPagination(
          response?.data?.data?.pagination || {
            currentPage: 1,
            totalPages: 1,
          }
        );
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message ||
            "Failed to load therapist appointments."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [currentUser?.token, therapistId]);

  if (loading) {
    return <Loading />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mb-6 text-3xl font-semibold text-gray-800">
        Appointments
      </h2>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">Total</p>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            {stats.totalAppointments || 0}
          </p>
        </div>
        {Object.entries(stats.statusCounts || {}).map(([status, count]) => (
          <div key={status} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {status}
            </p>
            <p className="mt-2 text-2xl font-bold text-gray-800">{count}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment._id} className="border-t">
                <td className="px-4 py-3">
                  {appointment?.patientInfo?.fullName || "-"}
                </td>
                <td className="px-4 py-3">
                  {appointment?.patientInfo?.email || "-"}
                </td>
                <td className="px-4 py-3">
                  {appointment?.date
                    ? new Date(appointment.date).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-4 py-3">{appointment?.time || "-"}</td>
                <td className="px-4 py-3">{appointment?.status || "-"}</td>
              </tr>
            ))}
            {appointments.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                  No appointments found for this therapist.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        Page {pagination.currentPage} of {Math.max(1, pagination.totalPages || 1)}
      </p>
    </motion.div>
  );
};

export default AppointmentsTab;
