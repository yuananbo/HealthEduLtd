import React from "react";
import { motion } from "framer-motion";
import { FaFileMedical, FaVideo } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useDataFetching from "../../../../hooks/useFech";

const MedicalRecordsTelemedicine = ({ darkMode }) => {
  const [loading, error, data] = useDataFetching("/patient/profile");
  const medicalHistoryCount = Array.isArray(data?.medicalHistory)
    ? data.medicalHistory.length
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-md p-6`}
    >
      <h2 className="text-2xl font-semibold mb-2 flex items-center">
        <FaFileMedical className="mr-2 text-indigo-500" /> Medical Records &
        Telemedicine
      </h2>
      {loading ? (
        <p className="text-gray-500 mb-4">Loading summary...</p>
      ) : error ? (
        <p className="text-red-500 mb-4">Error loading summary</p>
      ) : (
        <p className="text-gray-600 mb-4">
          Medical history items:{" "}
          <span className="font-semibold">{medicalHistoryCount}</span>
        </p>
      )}

      <Link
        to="/patient/profile"
        className={`block w-full text-center py-3 px-4 rounded-lg ${
          darkMode
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-blue-500 hover:bg-blue-600"
        } text-white font-semibold transition duration-300 mb-4`}
      >
        View Full Medical History
      </Link>

      <button
        type="button"
        onClick={() => toast("Video consultation is coming soon")}
        className={`w-full py-3 px-4 rounded-lg ${
          darkMode
            ? "bg-green-600 hover:bg-green-700"
            : "bg-green-500 hover:bg-green-600"
        } text-white font-semibold transition duration-300 flex items-center justify-center`}
      >
        <FaVideo className="mr-2" /> Start Video Consultation
      </button>
    </motion.div>
  );
};

export default MedicalRecordsTelemedicine;
