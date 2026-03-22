import React, { useContext, useEffect, useState } from "react";
import TherapistProfile from "./TherapistProfile";
import UpcomingAppointments from "./UpcomingAppointments";
import StatCard from "./StatCard";
import Chart from "./Chart";
import api from "../../../../utils/api";
import { UserContext } from "../../../../context/UserContext";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const { currentUser } = useContext(UserContext);

  const getTherapistStats = async () => {
    setLoading(true);
    try {
      const response = await api.get("therapist/my-statistics", {});
      if (response.status === 200) {
        setData(response?.data);
      } else {
        console.error(
          "Failed to fetch therapists: Unexpected response status",
          response.status
        );
      }
    } catch (error) {
      console.error(
        "Error fetching therapists:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.token) {
      getTherapistStats();
    }
  }, [currentUser?.token]);

  /**
   * Design Pattern: Adapter (ViewModel mapper)
   * Why here: backend payload is normalized, but cards need display-safe values/format.
   * Problem solved: prevents UI breakage from null/undefined raw fields.
   * Extensibility/Maintainability: card rendering stays simple; formatting/default rules live in one place.
   */
  const stats = [
    { title: "Appointments", value: data?.totalAppointments ?? 0, icon: "calendar" },
    { title: "Patients", value: data?.totalPatients ?? 0, icon: "users" },
    { title: "Income", value: data?.totalIncome ?? 0, icon: "dollar-sign" },
    {
      title: "Rating",
      value:
        typeof data?.overallRating === "number"
          ? data.overallRating.toFixed(1)
          : "0.0",
      icon: "star",
    },
  ];

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50"
      } transition-colors duration-300`}
    >
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Therapist Dashboard</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${
              darkMode
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  {...stat}
                  loading={loading}
                  darkMode={darkMode}
                />
              ))}
            </div>

            {/* Chart */}
            <div
              className={`rounded-xl shadow-lg p-6 ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-xl font-semibold mb-4">
                Performance Overview
              </h2>
              {loading ? (
                <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                  Loading performance...
                </p>
              ) : (
                <Chart darkMode={darkMode} data={data?.performanceOverview || []} />
              )}
            </div>

            {/* Patients Table */}
            <div
              className={`rounded-xl shadow-lg overflow-hidden ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2 className="text-xl font-semibold p-6">Patients</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Last Visit
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      darkMode ? "divide-gray-700" : "divide-gray-200"
                    }`}
                  >
                    {loading ? (
                      <tr>
                        <td className="px-6 py-4" colSpan={3}>
                          Loading patients...
                        </td>
                      </tr>
                    ) : data?.recentPatients?.length > 0 ? (
                      data.recentPatients.map((patient) => (
                        <tr
                          key={patient.id}
                          className="hover:bg-opacity-10 hover:bg-gray-200 transition-colors duration-200"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            {patient.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {patient.age ?? "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {patient.lastVisit
                              ? new Date(patient.lastVisit).toLocaleDateString()
                              : "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-4" colSpan={3}>
                          No patient data yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Therapist Profile and Upcoming Appointments */}
          <div className="lg:col-span-1 space-y-8">
            <TherapistProfile darkMode={darkMode} />
            <UpcomingAppointments darkMode={darkMode} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
