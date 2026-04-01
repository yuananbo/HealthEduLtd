import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const PrivateRoutes = ({ allowedRoles }) => {
  const { currentUser, loading } = React.useContext(UserContext);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        navigate("/welcome");
      } else if (!allowedRoles.includes(currentUser.data.user.userType)) {
        navigate("/not-authorized");
      }
    }
  }, [currentUser, loading, navigate, allowedRoles]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (!currentUser) {
    return null;
  }

  if (!allowedRoles.includes(currentUser.data.user.userType)) {
    return null;
  }

  return <Outlet />;
};

export default PrivateRoutes;
