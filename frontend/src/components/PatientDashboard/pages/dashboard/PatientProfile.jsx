import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { UserContext } from "../../../../context/UserContext";
import api from "../../../../utils/api";

const formatValue = (value, suffix = "") => {
  if (value === undefined || value === null || value === "")
    return "Not set";
  return `${value}${suffix}`;
};

const PatientProfile = ({ darkMode }) => {
  const { currentUser } = React.useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/patient/profile");
        setProfile(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.token) fetchProfile();
    else setLoading(false);
  }, [currentUser?.token]);

  const displayAge = () => {
    const dob = profile?.dateOfBirth || currentUser?.data?.user?.dateOfBirth;
    if (!dob) return "Not set";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return isNaN(age) ? "Not set" : age;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          darkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-md p-6 animate-pulse`}
      >
        <div className="h-20 bg-gray-300 rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </motion.div>
    );
  }

  const user = profile || currentUser?.data?.user;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        darkMode ? "bg-gray-800" : "bg-white"
      } rounded-lg shadow-md p-6`}
    >
      <div className="flex items-center mb-4">
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-20 h-20 rounded-full mr-4"
          />
        ) : (
          <div className="w-20 h-20 rounded-full mr-4 bg-gray-300 flex items-center justify-center text-2xl font-semibold">
            {user?.firstName?.charAt(0) || "?"}
          </div>
        )}
        <div>
          <h2 className="text-2xl font-semibold">{`${user?.firstName || ""} ${user?.lastName || ""}`}</h2>
          <p className="text-lg text-gray-500">{`${user?.address?.city || ""}, ${user?.address?.country || ""}`}</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-blue-900/50" : "bg-blue-100"}`}>
          <p className="font-semibold">Age</p>
          <p className="text-xl">{displayAge()}</p>
        </div>
        <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-green-900/50" : "bg-green-100"}`}>
          <p className="font-semibold">Blood Type</p>
          <p className="text-xl">{formatValue(profile?.bloodType)}</p>
        </div>
        <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-yellow-900/50" : "bg-yellow-100"}`}>
          <p className="font-semibold">Height</p>
          <p className="text-xl">{formatValue(profile?.height, " cm")}</p>
        </div>
        <div className={`text-center p-3 rounded-lg ${darkMode ? "bg-red-900/50" : "bg-red-100"}`}>
          <p className="font-semibold">Weight</p>
          <p className="text-xl">{formatValue(profile?.weight, " kg")}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Link
          to="/patient/profile"
          className={`text-sm font-medium ${
            darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
          }`}
        >
          Edit
        </Link>
      </div>
    </motion.div>
  );
};

export default PatientProfile;
