import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaHome,
  FaUserMd,
  FaWheelchair,
  FaBookMedical,
} from "react-icons/fa";

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

const services = [
  {
    title: "Home Care Rehab",
    description: "Rehabilitation services at home with scheduled visits.",
    icon: FaHome,
    path: "/patient/home-care",
    color: "blue",
    bgClass: "bg-blue-500",
    hoverClass: "hover:bg-blue-600",
    textClass: "text-blue-600",
  },
  {
    title: "Therapist Appointment",
    description: "Book an in-person or telehealth appointment with a therapist.",
    icon: FaUserMd,
    path: "/patient/therapist-list",
    color: "green",
    bgClass: "bg-green-500",
    hoverClass: "hover:bg-green-600",
    textClass: "text-green-600",
  },
  {
    title: "Assistive Device",
    description: "Browse and request assistive devices for daily living.",
    icon: FaWheelchair,
    path: "/patient/assistive-device",
    color: "amber",
    bgClass: "bg-amber-500",
    hoverClass: "hover:bg-amber-600",
    textClass: "text-amber-600",
  },
  {
    title: "Education",
    description: "Learn about conditions, exercises, and self-care.",
    icon: FaBookMedical,
    path: "/patient/education",
    color: "purple",
    bgClass: "bg-purple-500",
    hoverClass: "hover:bg-purple-600",
    textClass: "text-purple-600",
  },
];

const ChooseServiceCards = ({ darkMode }) => {
  return (
    <motion.div
      className="mb-12"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: 0.08 },
        },
      }}
    >
      <h2
        className={`text-2xl font-bold mb-4 ${
          darkMode ? "text-gray-100" : "text-gray-800"
        }`}
      >
        Choose Service
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, i) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={service.path}
              custom={i}
              variants={cardVariants}
            >
              <Link to={service.path}>
                <div
                  className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    darkMode ? "bg-gray-800" : "bg-white"
                  }`}
                >
                  <div
                    className={`p-5 flex items-center justify-center ${service.bgClass} ${service.hoverClass} transition-colors`}
                  >
                    <Icon className="text-white text-4xl" />
                  </div>
                  <div className={`p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                    <h3
                      className={`font-semibold text-lg mb-2 ${service.textClass}`}
                    >
                      {service.title}
                    </h3>
                    <p
                      className={
                        darkMode ? "text-gray-400 text-sm" : "text-gray-600 text-sm"
                      }
                    >
                      {service.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ChooseServiceCards;
