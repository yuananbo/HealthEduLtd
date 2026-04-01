import React from "react";

const ToggleSwitch = () => (
  <label className="flex items-center cursor-pointer">
    <div className="relative">
      <input type="checkbox" className="sr-only" />
      <div className="w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
      <div className="dot absolute w-6 h-6 bg-white rounded-full shadow -left-1 -top-1 transition"></div>
    </div>
  </label>
);

export default ToggleSwitch;
