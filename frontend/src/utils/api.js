import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { getApiBaseUrl } from "./getApiBaseUrl";

const api = axios.create({
  baseURL: `${getApiBaseUrl()}/api/v1/`,
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

const isPublicAuthPath = (url = "") =>
  /\/(login|signup|register)(\?|#|$)/i.test(url) ||
  /\/setup\/create-super-admin\b/i.test(url);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    if (isPublicAuthPath(url)) {
      return config;
    }
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
    const url = error.config?.url || "";
    if (
      error.response &&
      error.response.status === 401 &&
      !isPublicAuthPath(url)
    ) {
      localStorage.removeItem("user");
      window.location.href = "/welcome";
    }
    return Promise.reject(error);
  }
);

export default api;
