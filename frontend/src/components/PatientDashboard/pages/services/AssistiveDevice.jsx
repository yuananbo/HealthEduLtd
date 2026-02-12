import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaWheelchair } from "react-icons/fa";

const AssistiveDevice = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-8"
    >
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4">
          <FaWheelchair className="text-3xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Assistive Device
        </h1>
        <p className="text-gray-600 mb-6">
          Browse and request assistive devices to support your daily living and
          rehabilitation.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This service is coming soon. You will be able to view available
          devices and submit requests here.
        </p>
        <Link
          to="/patient/"
          className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
};

export default AssistiveDevice;
