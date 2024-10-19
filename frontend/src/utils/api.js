import axios from "axios";
import { jwtDecode } from "jwt-decode";

const apiLocalUrl = "http://localhost:5000/";
const apiLiveUrl = "https://mobirehab.onrender.com/";

const api = axios.create({
  baseURL: `${apiLiveUrl}api/v1/`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to check if the token is expired
const isTokenExpired = (token) => {
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      if (isTokenExpired(user.token)) {
        // Token is expired, remove it and let the response interceptor handle the redirect
        localStorage.removeItem("user");
      } else {
        config.headers["Authorization"] = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("user");
      window.location.href = "/welcome";
    }
    return Promise.reject(error);
  }
);

export default api;
