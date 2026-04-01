import React from "react";
import { motion } from "framer-motion";

const WithdrawalRequestsTab = ({ therapistId }) => {
  // Fetch withdrawal requests here

  const handleApprove = (requestId) => {
    // Implement approve logic
  };

  const handleReject = (requestId) => {
    // Implement reject logic
  };

  const handleRequestDetails = (requestId) => {
    // Implement request more details logic
  };

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
