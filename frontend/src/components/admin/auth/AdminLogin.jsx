import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Input from "../../common/forms/Input";
import { loginFields } from "../../../constants/formFields";
import toast from "react-hot-toast";
import { UserContext } from "../../../context/UserContext";
import FormAction from "../../common/forms/FormAction";
import { adminBaseURL } from "../../../utils/adminApi";
import { motion } from "framer-motion";
import { FaUserShield } from "react-icons/fa";

const fields = loginFields;
const buildInitialState = () => {
  const state = {};
  fields.forEach((field) => {
    state[field.id] = "";
  });
  if (import.meta.env.DEV) {
    state["email-address"] = import.meta.env.VITE_ADMIN_DEV_EMAIL ?? "";
    state.password = import.meta.env.VITE_ADMIN_DEV_PASSWORD ?? "";
  }
  return state;
};

const LOCKOUT_MESSAGE = "连续五次不成功就锁30分钟";
const INVALID_CREDENTIALS_MESSAGE =
  "Incorrect email or password. Please try again.";

export default function AdminLogin() {
  const [loginState, setLoginState] = useState(buildInitialState);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useContext(UserContext);

  const handleChange = (e) => {
    setLoginState({ ...loginState, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        `${adminBaseURL}/login`,
        {
          email: loginState["email-address"],
          password: loginState["password"],
        },
        { withCredentials: true }
      );

      const { token } = response.data;
      if (!token) {
        toast.error(
          "Could not sign in (server unavailable). Please try again later."
        );
        return;
      }

      localStorage.setItem("user", JSON.stringify(response.data));
      setCurrentUser(response.data);
      toast.success("Logged in successfully");
      navigate("/admin/", { replace: true });
    } catch (error) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message || "";
      const shouldShowLockoutMessage =
        errorMessage.includes("Too many failed attempts") ||
        errorMessage.includes("Account is locked");
      const looksLikeBadCredentials =
        status === 400 ||
        /invalid login credentials|admin not found|check your email and password/i.test(
          errorMessage
        );

      toast.error(
        shouldShowLockoutMessage
          ? LOCKOUT_MESSAGE
          : looksLikeBadCredentials
            ? INVALID_CREDENTIALS_MESSAGE
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
