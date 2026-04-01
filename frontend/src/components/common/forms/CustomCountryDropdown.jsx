import React from "react";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";

const fixedInputClass =
  "rounded-md appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-greenPrimary focus:border-greenPrimary focus:z-10 sm:text-sm bg-white";

const CustomDropdown = ({
  value,
  handleChange,
  labelText,
  labelFor,
  customStyle,
  dropdownType = "country",
  country,
  ...props
}) => {
  return (
    <div className={`${customStyle}`}>
      <label
        htmlFor={labelFor}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {labelText}
      </label>
      {dropdownType === "country" ? (
        <CountryDropdown
          value={value}
          onChange={handleChange}
          className={fixedInputClass}
          {...props}
        />
      ) : (
        <RegionDropdown
          country={country}
          value={value}
          onChange={handleChange}
          className={fixedInputClass}
          {...props}
        />
      )}
    </div>
  );
};

export default CustomDropdown;
