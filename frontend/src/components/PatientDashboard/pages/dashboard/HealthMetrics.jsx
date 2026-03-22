import React from "react";
import { motion } from "framer-motion";
import { FaChartLine } from "react-icons/fa";
import { Link } from "react-router-dom";
import useDataFetching from "../../../../hooks/useFech";

const MetricCard = ({ title, value, subtitle }) => (
  <div className="bg-purple-50 p-4 rounded-lg">
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <div className="h-32 bg-purple-100 rounded-lg flex flex-col items-center justify-center px-4 text-center">
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {subtitle ? <div className="text-xs text-gray-600 mt-1">{subtitle}</div> : null}
    </div>
  </div>
);

const HealthMetrics = ({ darkMode }) => {
  const [loading, error, data] = useDataFetching(
    "/patient/monitoring/checkins/latest"
  );
  const latest = data?.data || null;

  const bp =
    typeof latest?.bloodPressure?.systolic === "number" &&
    typeof latest?.bloodPressure?.diastolic === "number"
      ? `${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic}`
      : "Not set";

  const hr =
    typeof latest?.heartRateBpm === "number" ? `${latest.heartRateBpm}` : "Not set";

  const sugar =
    typeof latest?.bloodSugar?.value === "number"
      ? `${latest.bloodSugar.value} ${latest.bloodSugar.unit}`
      : "Not set";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`col-span-1 md:col-span-2 lg:col-span-3 ${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-md p-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <h2 className="text-2xl font-semibold flex items-center">
          <FaChartLine className="mr-2 text-purple-500" /> Health Metrics
        </h2>
        <Link
          to="/patient/monitoring"
          className="text-sm font-medium text-purple-600 hover:text-purple-700"
        >
          Update
        </Link>
      </div>

      {loading ? (
        <p>Loading metrics...</p>
      ) : error ? (
        <p className="text-red-500">Error loading metrics</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Blood Pressure"
            value={bp}
            subtitle={latest?.date ? `Latest: ${latest.date}` : ""}
          />
          <MetricCard title="Heart Rate" value={hr} subtitle="bpm" />
          <MetricCard title="Blood Sugar" value={sugar} subtitle="" />
        </div>
      )}
    </motion.div>
  );
};

export default HealthMetrics;
