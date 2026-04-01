import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Input from "../../common/forms/Input";

const ResetPassword = () => {
  const [inputs, setInputs] = useState({ password: "", confirmPassword: "" });
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const token = new URLSearchParams(location.search).get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await axios.post("/api/patients/reset-password", {
        token,
        password,
        confirmPassword,
      });
      alert("Password reset successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error:", error);
      alert("Error resetting password");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <button type="submit">Reset Password</button>
    </form>
  );
};

export default ResetPassword;
