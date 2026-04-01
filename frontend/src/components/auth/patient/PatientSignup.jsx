import React from "react";
import Header from "../../common/Header";
import SignupForm from "./SignupForm";

const PatientSignup = ({ END_POINT }) => {
  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <div className="flex flex-col md:flex-row w-full h-full overflow-y-auto">
        <div className="w-full md:w-2/5 h-full bg-hoverColor md:flex hidden flex-col justify-center items-center p-4">
          <div className="w-1/2 h-1/2 flex justify-center items-center">
            <img
              src="https://res.cloudinary.com/da0fkowyd/image/upload/v1716320301/Gynecology_consultation-rafiki_d37prc.png"
              alt="Doctor attending to a patient remotely"
              className="max-h-full w-auto"
            />
          </div>
          <p className="text-white px-4 text-center bg-opacity-50 p-2 rounded mt-4">
            MOBIREHAB is a digital healthcare platform to improve accessibility
            and quality of rehabilitation services towards independent life. We
            serve Kigali, and we plan to launch in other parts of Rwanda soon.
          </p>
        </div>
        <div className="w-full md:w-3/5 h-full bg-white flex pt-60 lg:pt-0 items-center justify-center overflow-y-auto">
          <div className="w-3/4 mt-96 lg:mt-0">
            <Header
              heading="Welcome! Create your account and talk to a therapist now"
              paragraph="Already have an account? "
              linkName="Login"
              linkUrl="/patient/login"
            />
            <SignupForm API_ENDPOINT={END_POINT} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientSignup;
