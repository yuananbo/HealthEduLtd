import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBookMedical } from "react-icons/fa";

const Education = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-8"
    >
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-4">
          <FaBookMedical className="text-3xl" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Education</h1>
        <p className="text-gray-600 mb-6">
          Learn about conditions, exercises, and self-care to support your
          rehabilitation.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          This service is coming soon. You will find articles, videos, and
          resources here.
        </p>
        <Link
          to="/patient/"
          className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
};

export default Education;
