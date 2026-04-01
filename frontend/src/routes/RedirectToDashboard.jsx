import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import WelcomePage from "../pages/WelcomePage";

const RedirectToDashboard = () => {
  const { currentUser, loading } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        navigate("/welcome", { replace: true });
      } else {
        switch (currentUser.data.user.userType) {
          case "patient":
            navigate("/patient/", { replace: true });
            break;
          case "admin":
            navigate("/admin/", { replace: true });
            break;
          case "therapist":
            navigate("/therapist/", { replace: true });
            break;
          default:
            navigate("/", { replace: true });
        }
      }
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return <WelcomePage />;
};

export default RedirectToDashboard;
