import React from "react";

const AccountStatus = ({ isActive, isVerified }) => {
  const containerClass =
    "min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4";
  const cardClass =
    "bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full transition-all duration-300 ease-in-out transform hover:scale-105";
  const headingClass =
    "text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center";
  const paragraphClass = "text-gray-600 mb-4 text-center";
  const iconClass = "w-24 h-24 mx-auto mb-6";

  if (!isActive) {
    return (
      <div className={containerClass}>
        <div className={cardClass}>
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <h1 className={headingClass}>Account Not Activated</h1>
          <p className={paragraphClass}>
            Your account is not yet activated. Please check your email and click
            on the verification link to activate your account.
          </p>
          <p className={paragraphClass}>
            If you haven't received the email, please check your spam folder or
            contact support for assistance.
          </p>
          <button className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
            Resend Activation Email
          </button>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className={containerClass}>
        <div className={cardClass}>
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className={headingClass}>Account Verification Pending</h1>
          <p className={paragraphClass}>
            Your account is activated, but it's currently under review by our
            admin team.
          </p>
          <p className={paragraphClass}>
            You will receive an email once your account has been verified and
            you can access the dashboard.
          </p>
          <p className={paragraphClass}>Thank you for your patience.</p>
          <div className="mt-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AccountStatus;
