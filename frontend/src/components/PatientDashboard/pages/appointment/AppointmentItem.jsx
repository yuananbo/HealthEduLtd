import React from "react";
import useTherapistDetails from "../../../../hooks/useTherapistDetails";
import { Link } from "react-router-dom";

const AppointmentItem = ({ appointment, isSelected, onSelect }) => {
  const therapistId =
    typeof appointment?.therapist === "string"
      ? appointment.therapist
      : appointment?.therapist?._id;

  const shouldFetchTherapist = Boolean(therapistId);
  const { loading, error, therapist } = useTherapistDetails(
    shouldFetchTherapist ? therapistId : null
  );

  const therapistData =
    appointment?.therapist && typeof appointment.therapist === "object"
      ? appointment.therapist
      : therapist?.data;

  if (loading)
    return (
      <tr className="bg-white border-b">
        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </td>
      </tr>
    );

  if (error)
    return (
      <tr className="bg-white border-b">
        <td colSpan="7" className="px-6 py-4 text-center text-red-500">
          Error loading therapist details: {error}
        </td>
      </tr>
    );

  return (
    <tr
      className={`bg-white border-b hover:bg-gray-50 ${
        isSelected ? "bg-blue-50" : ""
      }`}
    >
      <td className="w-4 p-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
      </td>
      <td className="px-6 py-4">
        {therapistData ? (
          <div className="flex items-center">
            <img
              className="w-10 h-10 rounded-full mr-3"
              src={therapistData.profilePicture}
              alt={`${therapistData.firstName} ${therapistData.lastName}`}
            />
            <div>
              <p className="font-semibold text-gray-900">
                {therapistData.firstName} {therapistData.lastName}
              </p>
              <p className="text-xs text-gray-600">
                {therapistData.specialization}
              </p>
            </div>
          </div>
        ) : (
          "Loading..."
        )}
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            appointment.status === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : appointment.status === "Waiting for Payment"
              ? "bg-orange-100 text-orange-800"
              : appointment.status === "Confirmed" ||
                  appointment.status === "Accepted"
                ? "bg-green-100 text-green-800"
                : appointment.status === "Cancelled"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
          }`}
        >
          {appointment.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(appointment.date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{appointment.time}</td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(appointment.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Link
            to={`/patient/appointments/${appointment._id}`}
            className="font-medium text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
          >
            View details
          </Link>
          {appointment.status === "Waiting for Payment" && (
            <Link
              to={`/patient/appointments/${appointment._id}/pay`}
              className="font-medium text-orange-600 hover:text-orange-800 transition duration-150 ease-in-out"
            >
              Pay
            </Link>
          )}
        </div>
      </td>
    </tr>
  );
};

export default AppointmentItem;
