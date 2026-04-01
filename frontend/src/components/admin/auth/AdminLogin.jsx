import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../common/forms/Input";
import { loginFields } from "../../../constants/formFields";
import toast from "react-hot-toast";
import { UserContext } from "../../../context/UserContext";
import FormAction from "../../common/forms/FormAction";
import axios from "axios";
import { adminBaseURL } from "../../../utils/adminApi";
import { motion } from "framer-motion";
import { FaUserShield } from "react-icons/fa";

const fields = loginFields;
let fieldsState = {};
fields.forEach((field) => (fieldsState[field.id] = ""));

const LOCKOUT_MESSAGE = "连续五次不成功就锁30分钟";

export default function AdminLogin() {
  const [loginState, setLoginState] = useState(fieldsState);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);

  const handleChange = (e) => {
    setLoginState({ ...loginState, [e.target.id]: e.target.value });
  };

  const loginAdmin = async (email, password) => {
    try {
      const response = await axios.post(
        `${adminBaseURL}/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const token = response.data.token;
      if (token) {
        localStorage.setItem("user", JSON.stringify(response.data));
      } else {
        throw new Error("User not found or Invalid credentials");
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await loginAdmin(
        loginState["email-address"],
        loginState["password"]
      );
      setCurrentUser(userData);
      toast.success("Logged in successfully");
      navigate("/admin/", { replace: true });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "";
      const shouldShowLockoutMessage =
        errorMessage.includes("Too many failed attempts") ||
        errorMessage.includes("Account is locked");

      toast.error(
        shouldShowLockoutMessage
          ? LOCKOUT_MESSAGE
          : errorMessage || "An error occurred. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="mx-auto bg-purple-100 rounded-full p-3 inline-block"
          >
            <FaUserShield className="text-purple-600 text-4xl" />
          </motion.div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access the admin dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {fields.map((field) => (
              <Input
                key={field.id}
                handleChange={handleChange}
                value={loginState[field.id]}
                labelText={field.labelText}
                labelFor={field.labelFor}
                id={field.id}
                name={field.name}
                type={field.type}
                isRequired={field.isRequired}
                placeholder={field.placeholder}
                customClass="mb-4"
              />
            ))}
          </div>

          <FormAction
            handleSubmit={handleSubmit}
            text={loading ? "Logging in..." : "Login"}
            disabled={loading}
          />
        </form>
      </motion.div>
    </div>
  );
}
