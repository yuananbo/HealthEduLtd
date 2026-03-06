import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaClipboardCheck } from "react-icons/fa";
import useDataFetching from "../../../../hooks/useFech";

const DailyCheckInWidget = ({ darkMode }) => {
  const [loading, error, data] = useDataFetching(
    "/patient/monitoring/checkins/latest"
  );

  const latest = data?.data || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-md p-6`}
    >
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <FaClipboardCheck className="mr-2 text-indigo-500" /> Daily Check-in
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error loading check-in</p>
      ) : latest ? (
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-semibold">Latest:</span> {latest.date}
          </p>
          <p className="text-gray-600 text-sm">
            Mood: {latest.mood} • Pain: {latest.painLevel ?? "-"} • ADL:{" "}
            {latest.adlIndependence}
          </p>
          <Link
            to="/patient/monitoring"
            className="inline-block mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View / Update today&apos;s check-in
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-gray-500">No check-ins yet.</p>
          <Link
            to="/patient/monitoring"
            className="inline-block mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Create your first check-in
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default DailyCheckInWidget;

