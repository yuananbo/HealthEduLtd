import React from "react";
import { Link } from "react-router-dom";

const AppointmentRow = ({ appointment }) => {
  const patientData = appointment?.patient || {};
  const fullName = `${patientData?.firstName} ${patientData?.lastName}`.trim();

  return (
    <tr key={appointment._id}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
              {fullName.charAt(0)}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{fullName}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(appointment.date).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {appointment.time}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {appointment.service}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            appointment.status === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : appointment.status === "Accepted"
              ? "bg-green-100 text-green-800"
              : appointment.status === "Declined"
              ? "bg-red-100 text-red-800"
              : "bg-red-100 text-blue-800"
          }`}
        >
          {appointment.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <Link
          to={`/therapist/appointments/${appointment._id}`}
          className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:underline"
        >
          View Details
        </Link>
      </td>
    </tr>
  );
};

const AppointmentTable = ({ appointments }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <AppointmentRow key={appointment._id} appointment={appointment} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;
