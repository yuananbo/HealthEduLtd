import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { UserContext } from "../../../../context/UserContext";
import Loading from "../../../utilities/Loading";
import { adminBaseURL } from "../../../../utils/adminApi";
import toast from "react-hot-toast";
import PerformanceMetrics from "./PerformanceMatrix";
import IncomeTab from "./IncomeTab";
import PaymentsTab from "./PaymentsTab";
import WithdrawalRequestsTab from "./WithdrawalRequestsTab";
import AppointmentsTab from "./AppointmentsTab";
import TherapistProfile from "./TherapistProfile";
import SideTab from "./SideTab";

// const adminBaseLocalURL = "http://localhost:5000/api/admin";
// const adminBaseURL = "https://mobirehab.onrender.com/api/admin";

const TherapistDetails = () => {
  const { id } = useParams();
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onApprove, setOnApprove] = useState(false);
  const { currentUser } = useContext(UserContext);
  const [activeTab, setActiveTab] = useState("profile");

  const getTherapist = async () => {
    try {
      const response = await axios.get(`${adminBaseURL}/therapists/${id}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        setTherapist(response?.data?.data);
        setLoading(false);
      } else {
        console.error(
          "Failed to fetch therapist: Unexpected response status",
          response.status
        );
      }
    } catch (error) {
      console.error(
        "Error fetching therapist:",
        error.response?.data || error.message
      );
      setLoading(false);
    }
  };

  // Approve therapist account
  const approveTherapist = async () => {
    try {
      setOnApprove(true);
      const response = await axios.patch(
        `${adminBaseURL}/therapists/approve/${id}`,
        {
          isVerified: true,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setTherapist((prev) => ({
          ...prev,
          isVerified: true,
        }));

        console.log("Therapist approved successfully:", response.data);
        toast.success("Therapist approved successfully");

        setOnApprove(false);
      } else {
        console.error(
          "Failed to approve therapist: Unexpected response status",
          response.status
        );
        toast.error("Failed to approve therapist");
        setOnApprove(false);
      }
    } catch (error) {
      console.error(
        "Error approving therapist:",
        error.response?.data || error.message
      );
      toast.error(
        `An error occurred: ${error.response?.data?.message || error.message}`
      );
      setOnApprove(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.token) {
      getTherapist();
    }
  }, [currentUser.token]);

  if (loading) {
    return <Loading />;
  }

  if (!therapist) {
    return <div>No therapist data found</div>;
  }
  const tabs = [
    { id: "profile", label: "Profile", icon: "user" },
    { id: "appointments", label: "Appointments", icon: "calendar" },
    { id: "income", label: "Income", icon: "chart-bar" },
    { id: "payments", label: "Payments", icon: "credit-card" },
    { id: "withdrawals", label: "Withdrawal Requests", icon: "cash" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <SideTab
          therapist={therapist}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main content */}
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {!therapist.isVerified && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg"
                >
                  <p className="text-yellow-700">
                    This therapist is not yet verified. Please review their
                    details and verify their account.
                  </p>
                  <motion.button
                    onClick={approveTherapist}
                    disabled={onApprove}
                    className="mt-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {onApprove ? "Verifying..." : "Verify Therapist"}
                  </motion.button>
                </motion.div>
              )}

              {therapist.isVerified && <PerformanceMetrics therapistId={id} />}

              {activeTab === "profile" && (
                <TherapistProfile therapist={therapist} />
              )}
              {therapist.isVerified && (
                <>
                  {activeTab === "appointments" && (
                    <AppointmentsTab therapistId={id} />
                  )}
                  {activeTab === "income" && <IncomeTab therapistId={id} />}
                  {activeTab === "payments" && <PaymentsTab therapistId={id} />}
                  {activeTab === "withdrawals" && (
                    <WithdrawalRequestsTab therapistId={id} />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TherapistDetails;
