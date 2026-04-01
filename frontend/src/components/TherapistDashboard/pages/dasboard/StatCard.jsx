import React from "react";
import { FaCalendar, FaUsers, FaDollarSign, FaStar } from "react-icons/fa";
import StatsLoader from "./StatsLoader";

const StatCard = ({ title, value, icon, darkMode, loading }) => {
  const formatNumber = (num) => {
    const normalized = Number(num);
    if (Number.isNaN(normalized)) return "0";
    return normalized.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Determine if the value is income
  const isIncome = title.toLowerCase().includes("income");

  const getIcon = () => {
    switch (icon) {
      case "calendar":
        return <FaCalendar />;
      case "users":
        return <FaUsers />;
      case "dollar-sign":
        return <FaDollarSign />;
      case "star":
        return <FaStar />;
      default:
        return null;
    }
  };

  if (loading) return <StatsLoader darkMode={darkMode} />;

  // if (error) return <div>Error fetching data</div>;

  // console.log("statistics data:", data);

  return (
    <div
      className={`rounded-xl shadow-lg p-6 ${
        darkMode ? "bg-gray-800" : "bg-white"
      } transform hover:scale-105 transition-all duration-300 border-l-4 ${
        isIncome ? "border-green-500" : "border-indigo-500"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`text-3xl ${darkMode ? "text-gray-300" : "text-gray-600"}`}
        >
          {getIcon()}
        </div>
        <div
          className={`text-sm font-medium ${
            darkMode ? "text-gray-400" : "text-gray-500"
          } uppercase`}
        >
          {title}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1 flex items-baseline">
        {isIncome && <span className="text-lg mr-1">RWF</span>}
        {isIncome ? formatNumber(value) : value ?? 0}
      </div>
      <div
        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
      >
        {isIncome ? "Total Income" : `Total ${title}`}
      </div>
    </div>
  );
};

export default StatCard;
