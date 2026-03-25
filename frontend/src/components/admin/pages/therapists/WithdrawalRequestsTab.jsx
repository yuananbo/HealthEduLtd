import React from "react";
import { motion } from "framer-motion";

const WithdrawalRequestsTab = ({ therapistId: _therapistId }) => {
  // Fetch withdrawal requests here

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        Withdrawal Requests
      </h2>
      {/* Add list of withdrawal requests here */}
      {/* For each request, add approve, reject, and request details buttons */}
    </motion.div>
  );
};

export default WithdrawalRequestsTab;
