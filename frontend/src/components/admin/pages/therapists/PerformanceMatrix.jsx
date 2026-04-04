import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserContext } from "../../../../context/UserContext";
import Loading from "../../../utilities/Loading";
import axios from "axios";
import { adminBaseURL } from "../../../../utils/adminApi";

const PerformanceMetrics = ({ therapistId }) => {
  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(UserContext);

  const getTherapistStats = async () => {
    try {
      const response = await axios.get(
        `${adminBaseURL}/therapists/${therapistId}/stats`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
        }
      );

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

  useEffect(() => {
    if (currentUser?.token) {
      getTherapistStats();
    }
  }, [currentUser?.token]);

  if (loading) {
    return <Loading />;
  }

  const metrics = {
    totalAppointments: therapist?.totalAppointments || 0,
    totalIncome: therapist?.paymentInfo?.[0]?.totalAmount || 0,
    currency: therapist?.paymentInfo?.[0]?.currency || "",
    averageRating: therapist?.averageRating || 0,
    ratingCount: therapist?.ratingCount || 0,
    completionRate: therapist?.completionRate || 0,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <MetricCard
        title="Total Appointments"
        value={metrics.totalAppointments}
        icon="fa-calendar-check"
        color="bg-blue-500"
      />
      <MetricCard
        title="Total Income"
        value={`${metrics.currency} ${metrics.totalIncome.toFixed(2)}`.trim()}
        icon="fa-dollar-sign"
        color="bg-green-500"
      />
      <MetricCard
        title="Average Rating"
        value={`${metrics.averageRating.toFixed(1)} (${metrics.ratingCount})`}
        icon="fa-star"
        color="bg-yellow-500"
      />
      <MetricCard
        title="Completion Rate"
        value={`${(metrics.completionRate * 100).toFixed(1)}%`}
        icon="fa-check-circle"
        color="bg-purple-500"
      />
    </motion.div>
  );
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

const MetricCard = ({ title, value, icon, color }) => (
  <motion.div
    variants={itemVariants}
    className={`${color} rounded-lg shadow-lg p-6 text-white`}
    whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 300 } }}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="text-4xl opacity-80">
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
  </motion.div>
);

export default PerformanceMetrics;
