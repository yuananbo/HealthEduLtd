import React, { useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";

const fixedInputClass =
  "rounded-md appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-greenPrimary focus:border-greenPrimary focus:z-10 sm:text-sm";

export default function Input({
  handleChange,
  value,
  labelText,
  labelFor,
  id,
  name,
  type,
  isRequired = false,
  placeholder,
  customClass,
  component = "input",
}) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className={`${customClass}`}>
      <label
        htmlFor={labelFor}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {labelText}
      </label>
      {component === "textarea" ? (
        <textarea
          onChange={handleChange}
          value={value}
          id={id}
          name={name}
          required={isRequired}
          className={`${fixedInputClass} ${customClass}`}
          placeholder={placeholder}
          rows="6"
        />
      ) : component === "datepicker" ? (
        <input
          onChange={handleChange}
          value={value}
          id={id}
          name={name}
          type="date"
          required={isRequired}
          className={`${fixedInputClass} ${customClass}`}
          placeholder={placeholder}
        />
      ) : type === "password" ? (
        <div className="relative">
          <input
            onChange={handleChange}
            value={value}
            id={id}
            name={name}
            type={showPassword ? "text" : "password"}
            required={isRequired}
            className={`${fixedInputClass} ${customClass}`}
            placeholder={placeholder}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
          </button>
        </div>
      ) : (
        <input
          onChange={handleChange}
          value={value}
          id={id}
          name={name}
          type={type}
          required={isRequired}
          className={`${fixedInputClass} ${customClass}`}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
