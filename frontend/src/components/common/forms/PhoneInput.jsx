import React from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const CustomPhoneInput = ({
  labelText,
  labelFor,
  id,
  inputStyle = {},
  searchStyle = {},
  dropdownStyle = {},
  isRequired = false,
  isInvalid = false,
  ...props
}) => {
  return (
    <div>
      <label
        htmlFor={labelFor || id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {labelText}
      </label>
      <PhoneInput
        id={id}
        prefix="+"
        containerClass={`custom-phone-input ${isInvalid ? "is-invalid" : ""}`}
        buttonClass="custom-phone-input__flag-button"
        inputClass="custom-phone-input__field"
        dropdownClass="custom-phone-input__dropdown"
        searchClass="custom-phone-input__search"
        enableSearch
        countryCodeEditable={false}
        disableCountryGuess
        specialLabel=""
        inputProps={{ required: isRequired, name: labelFor || id }}
        inputStyle={{
          width: "100%",
          ...inputStyle,
        }}
        searchStyle={{
          width: "100%",
          ...searchStyle,
        }}
        dropdownStyle={{
          ...dropdownStyle,
        }}
        {...props}
      />
    </div>
  );
};

export default CustomPhoneInput;
