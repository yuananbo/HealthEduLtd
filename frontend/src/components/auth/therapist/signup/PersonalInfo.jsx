import React from "react";
import Input from "../../../common/forms/Input";
import CustomDropdown from "../../../common/forms/CustomDropdown";
import CustomPhoneInput from "../../../common/forms/PhoneInput";
import CustomCountryDropdown from "../../../common/forms/CustomCountryDropdown";

const PersonalInfo = ({ formData, handleChange }) => {
  return (
    <>
      <div className="flex flex-wrap -mx-3 mb-0 lg:mb-4">
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <Input
            handleChange={handleChange}
            value={formData.firstName}
            labelText="First Name"
            labelFor="firstName"
            id="firstName"
            name="firstName"
            type="text"
            isRequired={true}
            placeholder="First Name"
          />
        </div>
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <Input
            handleChange={handleChange}
            value={formData.lastName}
            labelText="Last Name"
            labelFor="lastName"
            id="lastName"
            name="lastName"
            type="text"
            isRequired={true}
            placeholder="Last Name"
          />
        </div>
      </div>

      <div className="flex flex-wrap -mx-3 mb-0 lg:mb-4">
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <Input
            handleChange={handleChange}
            value={formData.email}
            labelText="Email Address"
            labelFor="email"
            id="email"
            name="email"
            type="email"
            isRequired={true}
            placeholder="example@email.com"
          />
        </div>
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <CustomDropdown
            handleChange={handleChange}
            value={formData.gender}
            labelText="Gender"
            labelFor="gender"
            id="gender"
            name="gender"
            isRequired={true}
            options={["Male", "Female"]}
            placeholder="Gender"
          />
        </div>
      </div>

      <div className="flex flex-wrap -mx-3 mb-0 lg:mb-4">
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <CustomPhoneInput
            country={"rw"}
            labelText={"Phone Number"}
            labelFor="phoneNumber"
            value={formData.phoneNumber}
            onChange={(phone) =>
              handleChange({
                target: { name: "phoneNumber", value: phone },
              })
            }
            placeholder="Phone Number"
          />
        </div>
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <CustomPhoneInput
            country={"rw"}
            value={formData.alternativePhoneNumber}
            labelText={"Alternative Phone Number"}
            labelFor="alternativePhoneNumber"
            onChange={(phone) =>
              handleChange({
                target: { name: "alternativePhoneNumber", value: phone },
              })
            }
            placeholder="Alternative Phone Number"
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-0 lg:mb-4">
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <CustomCountryDropdown
            value={formData.address.country}
            handleChange={(country) =>
              handleChange({
                target: { name: "country", value: country },
              })
            }
            name="country"
            labelFor="country"
            labelText="Country"
          />
        </div>
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <CustomCountryDropdown
            country={formData.address.country}
            value={formData.address.city}
            handleChange={(city) =>
              handleChange({
                target: { name: "city", value: city },
              })
            }
            name="city"
            labelFor="city"
            labelText="Region/City"
            dropdownType="region"
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-0 lg:mb-4">
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <Input
            handleChange={handleChange}
            value={formData.address.district}
            labelText="District"
            labelFor="district"
            id="district"
            name="district"
            type="text"
            placeholder="District"
          />
        </div>
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <Input
            handleChange={handleChange}
            value={formData.address.street}
            labelText="Street"
            labelFor="street"
            id="street"
            name="street"
            type="text"
            placeholder="Street Address"
          />
        </div>
      </div>

      <div className="flex flex-wrap -mx-3 mb-0 lg:mb-4">
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <Input
            handleChange={handleChange}
            value={formData.password}
            labelText="Password"
            labelFor="password"
            id="password"
            name="password"
            type="password"
            placeholder="*************"
          />
        </div>
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <Input
            handleChange={handleChange}
            value={formData.confirmPassword}
            labelText="Confirm Password"
            labelFor="confirmPassword"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="*************"
          />
        </div>
      </div>
    </>
  );
};

export default PersonalInfo;
