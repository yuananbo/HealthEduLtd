import React, { createContext, useState, useEffect } from "react";
import { isAuthenticated } from "../services/AuthServices";
import { useNavigate } from "react-router-dom";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Keep React state and localStorage in sync.
  const updateCurrentUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const user = await isAuthenticated();
      if (user) {
        setCurrentUser(user);
      } else {
        const currentPath = window.location.pathname;
        if (
          !currentPath.includes("/welcome") &&
          !currentPath.includes("/signup") &&
          !currentPath.includes("/login")
        ) {
          navigate("/welcome", { replace: true });
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser: updateCurrentUser, loading }}
    >
      {!loading && children}
    </UserContext.Provider>
  );
};
