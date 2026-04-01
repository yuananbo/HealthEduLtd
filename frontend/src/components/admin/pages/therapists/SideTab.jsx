import React from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaCalendar,
  FaChartBar,
  FaCreditCard,
  FaMoneyBillWave,
  FaCheckCircle,
} from "react-icons/fa";

const SideTab = ({ therapist, activeTab, setActiveTab }) => {
  const tabs = [
    { id: "profile", label: "Profile", Icon: FaUser },
    { id: "appointments", label: "Appointments", Icon: FaCalendar },
    { id: "income", label: "Income", Icon: FaChartBar },
    { id: "payments", label: "Payments", Icon: FaCreditCard },
    { id: "withdrawals", label: "Withdrawal Requests", Icon: FaMoneyBillWave },
  ];

  return (
    <motion.div
      className="bg-white shadow-lg rounded-lg overflow-hidden w-64"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-6">
        <div className="text-center mb-8 relative">
          <div className="relative inline-block">
            <img
              src={therapist.profilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto border-4 border-blue-500 shadow-lg"
            />
            {therapist.isVerified && (
              <div className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4">
                <FaCheckCircle className="text-green-500 text-2xl bg-white rounded-full border-2 border-white" />
              </div>
            )}
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            {`${therapist.firstName} ${therapist.lastName}`}
          </h2>
          <p className="text-blue-600 font-semibold">
            {therapist.specialization}
          </p>
          <p className="text-sm text-gray-600 mt-1">{therapist.profession}</p>
          <p className="text-xs text-gray-500 mt-1">
            ID: {therapist.therapistId}
          </p>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              className={`w-full text-left py-3 px-4 rounded-lg transition-colors flex items-center ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-blue-100"
              }`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <tab.Icon className="mr-3" />
              {tab.label}
            </motion.button>
          ))}
        </nav>
      </div>
    </motion.div>
  );
};

export default SideTab;
