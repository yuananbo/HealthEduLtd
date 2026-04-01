import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaUserMd, FaUserShield } from "react-icons/fa";

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

const WelcomePage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.2,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 px-4 py-12 relative">
      <motion.div
        className="w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600 mb-8"
          variants={itemVariants}
        >
          Welcome to MOBIREHAB
        </motion.h1>

        <motion.p
          className="text-xl text-center text-gray-600 mb-12"
          variants={itemVariants}
        >
          Empowering your recovery journey with cutting-edge mobile
          rehabilitation.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <UserCard
            title="Patient"
            icon={FaUser}
            loginPath="/patient/login"
            signupPath="/patient/signup"
            color="blue"
          />
          <UserCard
            title="Therapist"
            icon={FaUserMd}
            loginPath="/therapist/login"
            signupPath="/therapist/signup"
            color="green"
          />
        </div>

        <motion.div className="mt-12 text-center" variants={itemVariants}>
          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center space-x-2 bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-300"
          >
            <FaUserShield className="text-xl" />
            <span>Admin Portal</span>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-4 text-sm text-gray-500"
        variants={itemVariants}
      >
        © 2023 MOBIREHAB. All rights reserved.
      </motion.div>
    </div>
  );
};

const UserCard = ({ title, icon: Icon, loginPath, signupPath, color }) => {
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105`}
      variants={itemVariants}
    >
      <div className={`bg-${color}-600 p-6 flex items-center justify-center`}>
        <Icon className="text-white text-5xl" />
      </div>
      <div className="p-6">
        <h2 className={`text-2xl font-bold text-${color}-600 mb-4`}>{title}</h2>
        <div className="space-y-4">
          <Link
            to={loginPath}
            className={`block w-full text-center py-2 px-4 rounded bg-${color}-600 text-white hover:bg-${color}-700 transition-colors duration-300`}
          >
            Login
          </Link>
          <Link
            to={signupPath}
            className={`block w-full text-center py-2 px-4 rounded border border-${color}-600 text-${color}-600 hover:bg-${color}-50 transition-colors duration-300`}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomePage;
