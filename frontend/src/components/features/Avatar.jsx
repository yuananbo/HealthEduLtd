import React from "react";

const Avatar = ({ src, alt }) => {
  return (
    <img className="inline-block h-10 w-10 rounded-full" src={src} alt={alt} />
  );
};

const Badge = ({ type, children }) => {
  const colorClasses =
    type === "danger" ? "bg-red-600 text-white" : "bg-gray-300 text-gray-800";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}
    >
      {children}
    </span>
  );
};

export { Avatar, Badge };
