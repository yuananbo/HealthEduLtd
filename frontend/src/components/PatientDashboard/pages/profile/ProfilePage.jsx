import React, { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaNotesMedical, FaLock } from "react-icons/fa";
import PersonalInfoTab from "./PersonalInfoTab";
import MedicalInfoTab from "./MedicalInfoTab";
import SecurityTab from "./SecurityTab";
import api from "../../../../utils/api";
import Loading from "../../../utilities/Loading";
import toast from "react-hot-toast";
import { UserContext } from "../../../../context/UserContext";

const PatientProfilePage = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const reloadPatient = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const response = await api.get("/patient/profile");
      const nextPatient = response.data;
      setPatient(nextPatient);
      if (currentUser?.data?.user?._id && nextPatient?._id) {
        setCurrentUser({
          ...currentUser,
          data: { ...(currentUser.data || {}), user: nextPatient },
        });
      }
    } catch (err) {
      console.error("Error fetching patient profile:", err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Error fetching patient profile";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadPatient();
  }, []);

  const tabContent = {
    personal: (
      <PersonalInfoTab
        patient={patient}
        setPatient={setPatient}
        reloadPatient={reloadPatient}
      />
    ),
    medical: (
      <MedicalInfoTab
        patient={patient}
        setPatient={setPatient}
        reloadPatient={reloadPatient}
      />
    ),
    security: (
      <SecurityTab patient={patient} reloadPatient={reloadPatient} />
    ),
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      {loading ? (
        <Loading />
      ) : loadError ? (
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Couldn&apos;t load your profile
          </h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={reloadPatient}
              className="px-4 py-2 rounded-md bg-greenPrimary text-white hover:bg-greenHover transition"
            >
              Retry
            </button>
            <a
              href="/welcome"
              className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
            >
              Go to login
            </a>
          </div>
        </div>
      ) : !patient ? (
        <Loading />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-2xl rounded-lg overflow-hidden"
        >
          <div className="flex flex-wrap border-b bg-greenPrimary">
            {[
              { name: "personal", icon: <FaUser /> },
              { name: "medical", icon: <FaNotesMedical /> },
              { name: "security", icon: <FaLock /> },
            ].map((tab) => (
              <motion.button
                key={tab.name}
                className={`flex-1 py-4 px-6 text-center font-medium flex items-center justify-center ${
                  activeTab === tab.name
                    ? "bg-white text-greenPrimary"
                    : "text-white hover:bg-greenHover"
                }`}
                onClick={() => setActiveTab(tab.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab.icon}
                <span className="ml-2">
                  {tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}
                </span>
              </motion.button>
            ))}
          </div>
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PatientProfilePage;
