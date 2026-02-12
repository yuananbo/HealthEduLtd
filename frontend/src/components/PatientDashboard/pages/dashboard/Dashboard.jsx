import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HealthTip from "./HealthTip";
import ChooseServiceCards from "./ChooseServiceCards";
import { healthTips, mockPatient } from "./mockData";
import PatientProfile from "./PatientProfile";
import UpcomingAppointments from "./UpcomingAppointments";
import AppointmentHistory from "./AppointmentHistory";
import HealthMetrics from "./HealthMetrics";
import Medications from "./Medications";
import MedicalRecordsTelemedicine from "./MedicalRecordsTelemedicine";
import { UserContext } from "../../../../context/UserContext";

const Dashboard = ({ darkMode }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const { currentUser } = React.useContext(UserContext);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % healthTips.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-2 text-left">Welcome back,</h1>
          <h2
            className={`text-5xl font-extrabold text-left ${
              darkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {currentUser?.data?.user?.firstName}!
          </h2>
          <p
            className={`text-xl mt-2 ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Here's your health overview for today.
          </p>
        </motion.div>

        <ChooseServiceCards darkMode={darkMode} />

        <div className="mb-12">
          <AnimatePresence mode="wait">
            <HealthTip
              key={currentTipIndex}
              tip={healthTips[currentTipIndex]}
            />
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PatientProfile darkMode={darkMode} />
          <UpcomingAppointments darkMode={darkMode} />
          <AppointmentHistory
            appointments={mockPatient.appointmentHistory}
            darkMode={darkMode}
          />
          <HealthMetrics darkMode={darkMode} />
          <Medications
            medications={mockPatient.medications}
            darkMode={darkMode}
          />
          <MedicalRecordsTelemedicine darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
