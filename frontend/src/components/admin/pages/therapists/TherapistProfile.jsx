import React from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaPhoneAlt,
  FaBriefcase,
  FaStethoscope,
  FaClock,
  FaIdCard,
  FaFileAlt,
  FaFilePdf,
} from "react-icons/fa";

const TherapistProfile = ({ therapist }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 rounded-xl shadow-lg"
    >
      <motion.h2
        variants={itemVariants}
        className="text-3xl font-bold text-indigo-800 mb-6 text-center"
      >
        Therapist Profile
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">
            Personal Information
          </h3>
          <InfoItem
            label="Full Name"
            value={`${therapist.firstName} ${therapist.lastName}`}
            Icon={FaUser}
          />
          <InfoItem label="Email" value={therapist.email} Icon={FaEnvelope} />
          <InfoItem
            label="Phone"
            value={therapist.phoneNumber}
            Icon={FaPhone}
          />
          {therapist.alternativePhoneNumber && (
            <InfoItem
              label="Alternative Phone"
              value={therapist.alternativePhoneNumber}
              Icon={FaPhoneAlt}
            />
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-xl font-semibold text-indigo-700 mb-4">
            Professional Information
          </h3>
          <InfoItem
            label="Profession"
            value={therapist.profession}
            Icon={FaBriefcase}
          />
          <InfoItem
            label="Specialization"
            value={therapist.specialization}
            Icon={FaStethoscope}
          />
          <InfoItem
            label="Experience"
            value={`${therapist.numOfYearsOfExperience} years`}
            Icon={FaClock}
          />
          <InfoItem
            label="License Number"
            value={therapist.licenseNumber}
            Icon={FaIdCard}
          />
        </motion.div>
      </div>

      <motion.div
        variants={itemVariants}
        className="mt-6 bg-white p-6 rounded-lg shadow-md"
      >
        <h3 className="text-xl font-semibold text-indigo-700 mb-4">Bio</h3>
        <p className="text-gray-700 leading-relaxed">{therapist.bio}</p>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-6">
        <h3 className="text-xl font-semibold text-indigo-800 mb-4">
          Documents
        </h3>
        <div className="flex flex-wrap gap-4">
          <DocumentButton
            href={therapist.licenseDocument}
            text="View License"
            Icon={FaFileAlt}
          />
          <DocumentButton href={therapist.cv} text="View CV" Icon={FaFilePdf} />
        </div>
      </motion.div>
    </motion.div>
  );
};

const InfoItem = ({ label, value, Icon }) => (
  <div className="flex items-center mb-3 last:mb-0">
    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
      <Icon className="text-indigo-600 text-xl" />
    </div>
    <div>
      <span className="font-medium text-gray-700">{label}</span>
      <p className="text-gray-600">{value}</p>
    </div>
  </div>
);

const DocumentButton = ({ href, text, Icon }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <Icon className="mr-2" />
    {text}
  </motion.a>
);

export default TherapistProfile;
