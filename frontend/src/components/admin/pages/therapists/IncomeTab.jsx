import React from "react";
import { motion } from "framer-motion";

const IncomeTab = ({ therapistId }) => {
  // Fetch income data here

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Income</h2>
      {/* Add income charts and statistics here */}
    </motion.div>
  );
};

export default IncomeTab;
