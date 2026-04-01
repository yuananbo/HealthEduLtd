import React from "react";
import LoginForm from "../LoginForm";
import Header from "../../common/Header";

const TherapistLogin = ({ END_POINT }) => {
  return (
    <div className="w-screen h-screen flex overflow-hidden">
      <div className="flex flex-col md:flex-row w-full h-full">
        <div className="w-full md:w-1/2 h-full bg-hoverColor md:flex hidden flex-col justify-center items-center p-4">
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
        <div className="w-full md:w-1/2 h-full bg-white flex items-center justify-center">
          <div className="flex-wrap w-3/4">
            <Header
              heading="Welcome Back. Login into your account and talk to a therapist now"
              paragraph="Don't have an account yet? "
              linkName="Signup"
              linkUrl="/patient/signup"
            />
            <LoginForm
              API_ENDPOINT={END_POINT}
              place={"/patient/forgot-password"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistLogin;
