import React, { useState } from "react";
import { motion } from "framer-motion";

const PaymentsTab = ({ therapistId }) => {
  const [amount, setAmount] = useState("");

  const handlePayment = () => {
    // Implement payment logic here
    console.log("Payment logic here");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Payments</h2>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Make a Payment
        </h3>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="border border-gray-300 rounded-lg px-4 py-2 w-64"
          />
          <button
            onClick={handlePayment}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            Pay Therapist
          </button>
        </div>
      </div>
      {/* Add payment history here */}
    </motion.div>
  );
};

export default PaymentsTab;
