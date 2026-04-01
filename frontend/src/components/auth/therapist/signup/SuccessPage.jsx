import React from "react";
import { useNavigate } from "react-router-dom";

const SuccessPage = ({ success }) => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div>
        <div className="flex flex-col items-center space-y-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-28 w-28 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-4xl font-bold">Thank You!</h1>
          <p className="text-center">
            {success
              ? "Account has been successfully verified. Login now."
              : "Please check your email to verify your account."}
          </p>
          <button
            onClick={handleBackToLogin}
            className="inline-flex items-center rounded border border-indigo-600 bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 00-.707.293l-8 8a1 1 0 000 1.414l8 8a1 1 0 001.414-1.414L4.414 11H18a1 1 0 100-2H4.414l6.293-6.293A1 1 0 0010 2z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">Back to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
