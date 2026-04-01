import React from "react";

const Dropdown = ({ children, isOpen, align, onClose }) => {
  return (
    isOpen && (
      <div
        className={`absolute ${
          align === "right" ? "right-0" : "left-0"
        } mt-2 w-48 bg-white rounded-md shadow-lg z-20`}
      >
        <div
          className="py-2"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          {children}
        </div>
      </div>
    )
  );
};

const DropdownItem = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
    >
      {children}
    </button>
  );
};

export { Dropdown, DropdownItem };
