import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHome } from "react-icons/fa";

const HomeCareRehab = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-8"
    >
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
          <FaHome className="text-3xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Home Care Rehab
        </h1>
        <p className="text-gray-600 mb-6">
          Rehabilitation services at home. Schedule visits from qualified
          therapists for your recovery journey.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This service is coming soon. You will be able to request home visits
          and manage your home care schedule here.
        </p>
        <Link
          to="/patient/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
};

export default HomeCareRehab;
