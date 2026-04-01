import React from "react";
import { motion } from "framer-motion";

const HealthTip = ({ tip }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="bg-gradient-to-r from-blue-400 to-blue-600 p-6 rounded-lg shadow-md text-white"
  >
    <div className="flex items-center mb-3">
      {tip.icon}
      <h3 className="text-xl font-semibold ml-3">{tip.title}</h3>
    </div>
    <p className="text-lg">{tip.content}</p>
  </motion.div>
);

export default HealthTip;
