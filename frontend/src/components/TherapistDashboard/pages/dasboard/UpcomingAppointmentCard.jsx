import React from "react";

const UpcomingAppointmentCard = ({ appointment, userType, darkMode }) => {
  const { patient, therapist, date, time } = appointment;
  const displayName =
    userType === "patient"
      ? `${therapist.firstName} ${therapist.lastName}`
      : `${patient.firstName} ${patient.lastName}`;

  return (
    <div
      className={`rounded-lg p-4 flex justify-between items-center ${
        darkMode ? "bg-gray-700" : "bg-gray-100"
      } hover:shadow-md transition-shadow duration-300`}
    >
      <div>
        <h3 className="font-semibold">{displayName}</h3>
        <p
          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          {new Date(date).toLocaleDateString()} at {time}
        </p>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-sm ${
          darkMode
            ? "bg-indigo-900 text-indigo-200"
            : "bg-indigo-100 text-indigo-800"
        }`}
      >
        {appointment.service}
      </span>
    </div>
  );
};

export default UpcomingAppointmentCard;
