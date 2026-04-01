import React from "react";

const StatsLoader = ({ darkMode }) => {
  return (
    <div
      className={`rounded-xl shadow-lg p-6 ${
        darkMode ? "bg-gray-800" : "bg-white"
      } transform hover:scale-105 transition-all duration-300 border-l-4 border-gray-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
      </div>
      <div className="w-32 h-6 bg-gray-300 rounded animate-pulse mb-2"></div>
      <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
    </div>
  );
};

export default StatsLoader;
