import React from "react";

const ProgressBar = ({ steps, currentStep }) => {
  const stepWidth = (currentStep / steps.length) * 100 + "%";
  const stepColor = (index) =>
    index < currentStep - 1 ? "bg-green-500" : "bg-gray-200";

  return (
    <div className="w-full mb-4">
      <div className="relative h-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 h-2 w-full transition-all duration-500 ease-in-out ${stepColor(
              index
            )}`}
            style={{ width: index * (100 / (steps.length - 1)) + "%" }}
          />
        ))}
        <div
          className={`absolute top-0 left-0 h-2 bg-blueColor transition-all duration-500 ease-in-out`}
          style={{ width: stepWidth }}
        />
      </div>
      <ol className="flex justify-between w-full mt-8">
        {steps.map((step, index) => (
          <li
            key={index}
            className={`flex-1 text-center relative ${
              index === currentStep - 1 ? "text-greenPrimary" : "text-gray-500"
            }`}
          >
            <span
              className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full ${
                index < currentStep - 1 ? "bg-green-200" : "bg-gray-100"
              } flex items-center justify-center ring-4 ring-white`}
            >
              {index < currentStep - 1 ? (
                <svg
                  className="w-4 h-4 text-green-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 12"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5.917 5.724 10.5 15 1.5"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </span>
            <div className="mt-12">
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm">Step {index + 1}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ProgressBar;
