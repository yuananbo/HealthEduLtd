import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../../../services/AuthServices";
import Input from "../../common/forms/Input";
import CustomPhoneInput from "../../common/forms/PhoneInput";
import CustomDropdown from "../../common/forms/CustomDropdown";
import CustomCountryDropdown from "../../common/forms/CustomCountryDropdown";
import FormAction from "../../common/forms/FormAction";
import toast from "react-hot-toast";

const SignupForm = ({ API_ENDPOINT }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = today.getFullYear();
  const todayFormatted = yyyy + "-" + mm + "-" + dd;

  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    guardianPhoneNumber: "",
    gender: "Male",
    dateOfBirth: todayFormatted,
    address: {
      country: "Rwanda",
      city: "",
      district: "",
      street: "",
    },
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (
      name === "country" ||
      name === "city" ||
      name === "district" ||
      name === "street"
    ) {
      setInputs((prevInputs) => ({
        ...prevInputs,
        address: {
          ...prevInputs.address,
          [name]: value,
        },
      }));
    } else {
      setInputs((prevInputs) => ({
        ...prevInputs,
        [name]: value,
      }));
    }
  };

  const registerPatient = async () => {
    const data = {
      firstName: inputs.firstName,
      lastName: inputs.lastName,
      email: inputs.email,
      phoneNumber: inputs.phoneNumber,
      guardianPhoneNumber: inputs.guardianPhoneNumber,
      gender: inputs.gender,
      address: inputs.address,
      dateOfBirth: inputs.dateOfBirth,
      password: inputs.password,
      confirmPassword: inputs.confirmPassword,
    };

    const response = await signup(data, API_ENDPOINT);
    return response;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputs.password !== inputs.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (String(inputs.password).length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!inputs.address?.city?.trim()) {
      toast.error("Please select your region/city (required)");
      return;
    }
    setLoading(true);
    try {
      const response = await registerPatient();
      if (response) {
        toast.success("Patient registered successfully. Please login.");
        navigate("/patient/login", { replace: true });
        console.log("New user", response);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(error.response?.data?.message || "Error during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-wrap -mx-3 mb-0 lg:mb-4">
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <Input
            handleChange={handleChange}
            value={inputs.firstName}
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
            value={inputs.lastName}
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
            value={inputs.email}
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
            value={inputs.gender}
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
            value={inputs.phoneNumber}
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
            value={inputs.guardianPhoneNumber}
            labelText={"Guardian's Phone Number"}
            labelFor="guardianPhoneNumber"
            onChange={(phone) =>
              handleChange({
                target: { name: "guardianPhoneNumber", value: phone },
              })
            }
            placeholder="Guardian's Phone Number"
          />
        </div>
      </div>
      <div className="flex flex-wrap -mx-3 mb-0 lg:mb-4">
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <CustomCountryDropdown
            value={inputs.address.country}
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
            country={inputs.address.country}
            value={inputs.address.city}
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
            value={inputs.address.district}
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
            value={inputs.dateOfBirth}
            labelText="Date of Birth"
            labelFor="dateOfBirth"
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            placeholder="Date of Birth"
            component="datepicker"
            max={todayFormatted}
          />
        </div>
      </div>

      <div className="flex flex-wrap -mx-3 mb-0 lg:mb-4">
        <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
          <Input
            handleChange={handleChange}
            value={inputs.password}
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
            value={inputs.confirmPassword}
            labelText="Confirm Password"
            labelFor="confirmPassword"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="*************"
          />
        </div>
      </div>

      <div className="pb-6">
        <FormAction
          handleSubmit={handleSubmit}
          text={loading ? "Loading..." : "Register"}
        />
      </div>
    </form>
  );
};

export default SignupForm;
