import React from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt } from "react-icons/fa";
import useDataFetching from "../../../../hooks/useFech";

const UpcomingAppointments = ({ darkMode }) => {
  const [loading, error, data] = useDataFetching("/upcoming-appointments");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-md p-6`}
    >
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <FaCalendarAlt className="mr-2 text-blue-500" /> Upcoming Appointments
      </h2>
      {loading ? (
        <p>Loading Appointments...</p>
      ) : error ? (
        <p className="text-red-500">Error loading appointments</p>
      ) : data && data?.data?.length > 0 ? (
        data?.data?.map((appointment) => (
          <div key={appointment._id} className="mb-4 p-4 bg-blue-50 rounded-lg">
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
          </div>
        ))
      ) : (
        <p className="text-gray-500">No upcoming appointments</p>
      )}
    </motion.div>
  );
};

export default UpcomingAppointments;
