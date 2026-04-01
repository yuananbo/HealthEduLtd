import React from "react";
import { motion } from "framer-motion";

const AppointmentsTab = ({ therapistId }) => {
  // Fetch appointments data here

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        Appointments
      </h2>
      {/* Add appointments list or calendar view here */}
    </motion.div>
  );
};

export default AppointmentsTab;
