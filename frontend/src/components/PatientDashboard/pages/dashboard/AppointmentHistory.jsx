import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FaHistory } from "react-icons/fa";
import useDataFetching from "../../../../hooks/useFech";

const AppointmentHistory = ({ darkMode }) => {
  const [loading, error, data] = useDataFetching("/patient/appointments?limit=50");

  const historyAppointments = useMemo(() => {
    const items = Array.isArray(data?.data) ? data.data : [];
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return items
      .filter((a) => {
        const apptDate = a?.date ? new Date(a.date) : null;
        const isPast = apptDate ? apptDate < startOfToday : false;
        const isHistoryStatus = ["Completed", "Cancelled", "Declined"].includes(
          a?.status
        );
        return isPast || isHistoryStatus;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-md p-6`}
    >
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <FaHistory className="mr-2 text-green-500" /> Appointment History
      </h2>
      {loading ? (
        <p>Loading history...</p>
      ) : error ? (
        <p className="text-red-500">Error loading history</p>
      ) : historyAppointments.length > 0 ? (
        historyAppointments.map((appointment) => (
          <div
            key={appointment._id}
            className="mb-4 p-4 bg-green-50 rounded-lg"
          >
            <p className="font-semibold text-lg">
              Dr {appointment?.therapist?.firstName}{" "}
              {appointment?.therapist?.lastName} -{" "}
              {appointment?.therapist?.specialization}
            </p>
            <p className="text-gray-600">
              {new Date(appointment.date).toLocaleDateString()} at{" "}
              {appointment.time}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Status: {appointment.status}
            </p>
            {(appointment.notes || appointment.purpose) && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {appointment.notes || appointment.purpose}
              </p>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500">No appointment history yet</p>
      )}
    </motion.div>
  );
};

export default AppointmentHistory;
