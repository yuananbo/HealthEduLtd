import React, { useState } from "react";
import { CountryDropdown } from "react-country-state-dropdown";

const fixedInputClass =
  "rounded-md appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-greenPrimary focus:border-greenPrimary focus:z-10 sm:text-sm";

const CustomCountry = ({
  value,
  handleChange,
  labelText,
  labelFor,
  id,
  name,
  placeholder,
  customClass,
}) => {
  const [country, setCountry] = useState(value);

  const handleCountryChange = (e, selectedCountry) => {
    setCountry(selectedCountry);
    handleChange(selectedCountry);
  };

  return (
    <div className={`${customClass}`}>
      <label
        htmlFor={labelFor}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {labelText}
      </label>
      <CountryDropdown
        clearable
        value={country}
        onChange={handleCountryChange}
        className={`${fixedInputClass} ${customClass}`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default CustomCountry;
