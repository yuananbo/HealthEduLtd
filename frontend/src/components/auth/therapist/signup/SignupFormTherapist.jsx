import React, { useState } from "react";
import PersonalInfo from "./PersonalInfo";
import ProfessionalInfo from "./ProfessionalInfo";
import ProgressBar from "../../../utilities/ProgressBar";
import { signup } from "../../../../services/AuthServices";
import RequiredFiles from "./RequiredFiles.";
import api from "../../../../utils/api";

const SignupFormTherapist = ({ API_ENDPOINT }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    alternativePhoneNumber: "",
    gender: "Male",
    address: {
      country: "Rwanda",
      city: "Kigali",
      district: "",
      street: "",
    },
    profession: "",
    bio: "",
    numOfYearsOfExperience: "",
    licenseNumber: "",
    specialization: "Physiotherapist",
    licenseDocument: null,
    cv: null,
    profilePicture: null,
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (
      name === "country" ||
      name === "city" ||
      name === "district" ||
      name === "street"
    ) {
      setFormData((prevData) => ({
        ...prevData,
        address: {
          ...prevData.address,
          [name]: value,
        },
      }));
    } else {
      // For other input fields
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "file" ? files[0] : value,
      }));
    }
  };

  const steps = [
    {
      title: "Personal Info",
      content: <PersonalInfo formData={formData} handleChange={handleChange} />,
    },
    {
      title: "Professional Info",
      content: (
        <ProfessionalInfo formData={formData} handleChange={handleChange} />
      ),
    },
    {
      title: "Required Files",
      content: (
        <RequiredFiles formData={formData} handleChange={handleChange} />
      ),
    },
  ];

  const nextStep = (e) => {
    e.preventDefault();
    if (currentStep === steps.length) {
      handleFinalSubmission(e);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
      console.log("Form Data at Step", currentStep, ":", formData);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    console.log("Form Data at Step", currentStep, ":", formData);
  };

  const registerTherapist = async () => {
    try {
      setLoading(true);
      // const response = await signup(formData, API_ENDPOINT);
      const response = await api.post(API_ENDPOINT, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Registration successful:", response);
      alert(
        "Account created successfully. Please check your email for verification."
      );
      setCurrentStep(steps.length + 1);
    } catch (error) {
      console.error("Registration failed:", error);
      const apiMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error.message;
      alert(`Registration failed: ${apiMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmission = async (e) => {
    e.preventDefault();
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "gender",
      "address",
      "profession",
      "bio",
      "numOfYearsOfExperience",
      "specialization",
      "licenseNumber",
      "licenseDocument",
      "cv",
      "profilePicture",
      "password",
      "confirmPassword",
    ];
    const isAllFieldsFilled = requiredFields.every((field) => {
      if (typeof formData[field] === "object" && formData[field] !== null) {
        return Object.values(formData[field]).every(
          (value) => value?.toString().trim() !== ""
        );
      } else {
        return formData[field]?.toString().trim() !== "";
      }
    });

    if (!isAllFieldsFilled) {
      alert("Please fill in all required fields before submitting.");
      return;
    }

    if (
      window.confirm(
        "Have you reviewed your information and want to proceed with registration?"
      )
    ) {
      console.log("Final form data", formData);
      await registerTherapist();
    }
  };

  return (
    <form onSubmit={handleFinalSubmission} className="w-full">
      {currentStep <= steps.length ? (
        <>
          <ProgressBar steps={steps} currentStep={currentStep} />
          {steps[currentStep - 1].content}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded ${
                currentStep === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
              }`}
            >
              Previous
            </button>

            <button
              type={currentStep === steps.length ? "submit" : "button"}
              onClick={nextStep}
              disabled={loading} // Disable the button when loading
              className={`px-4 py-2 rounded ${
                loading
                  ? "bg-gray-500 text-gray-300 cursor-not-allowed" // Change color and cursor when loading
                  : currentStep === steps.length
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {loading
                ? "Registering..."
                : currentStep === steps.length
                ? "Complete Registration"
                : "Next"}
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Account Created Successfully
          </h2>
          <p className="mt-4 text-gray-600">
            Please check your email for the verification link.
          </p>
        </div>
      )}
    </form>
  );
};

export default SignupFormTherapist;
