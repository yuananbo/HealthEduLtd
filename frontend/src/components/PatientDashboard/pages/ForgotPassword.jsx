import React, { useState } from "react";
import axios from "axios";
import Input from "../../common/forms/Input";
import FormAction from "../../common/forms/FormAction";
import api from "../../../utils/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [inputs, setInputs] = useState({ email: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const response = await api.post(
        "/patient/forgot-password",
        { email: inputs.email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setMessage(response.data.message);
        toast.success("Password reset link sent successfully");
      } else {
        setMessage("Error sending reset link. Please try again.");
        toast.error("Error sending reset link. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Error sending reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="-space-y-px">
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

            <FormAction
              handleSubmit={handleSubmit}
              text={isLoading ? "Loading..." : "Login"}
              disabled={isLoading ? true : false}
            />
          </form>
          <div className="mt-6">
            <Link to="/patient/reset-password">Reset password</Link>
          </div>

          {message && (
            <div
              className={`mt-4 text-sm ${
                message.includes("Error") ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
