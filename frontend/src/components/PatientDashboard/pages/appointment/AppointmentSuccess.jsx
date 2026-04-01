import React from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";

const AppointmentSuccess = () => {
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Appointment submitted
      </h1>
      <p className="text-gray-600 mb-8">
        Your payment was received (or completed in demo mode). The therapist
        will see your booking as pending confirmation.
      </p>
      <Link
        to="/patient/appointments"
        className="inline-block bg-greenPrimary hover:bg-hoverColor text-white font-semibold py-3 px-8 rounded-lg transition duration-150"
      >
        View my appointments
      </Link>
    </div>
  );
};

export default AppointmentSuccess;
