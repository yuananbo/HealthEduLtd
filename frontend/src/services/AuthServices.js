import api from "../utils/api";
import { getApiBaseUrl } from "../utils/getApiBaseUrl";
import { jwtDecode } from "jwt-decode";

/** Backend mounts admin under `/api/admin`, not `/api/v1` — avoid broken URLs like `/api/v1/api/admin/...`. */
const resolveAuthRequestUrl = (API_ENDPOINT) => {
  if (/^https?:\/\//i.test(API_ENDPOINT)) {
    return API_ENDPOINT;
  }
  if (API_ENDPOINT.startsWith("/api/admin")) {
    return `${getApiBaseUrl()}${API_ENDPOINT}`;
  }
  return API_ENDPOINT;
};

// export const login = async (email, password, API_ENDPOINT) => {
//   try {
//     const response = await api.post(API_ENDPOINT, {
//       email,
//       password,
//     });

//     const token = response.data.token;

//     if (token) {
//       localStorage.setItem("user", JSON.stringify(response.data));
//     } else {
//       throw new Error("User not found or Invalid credentials");
//     }

//     return response.data;
//   } catch (err) {
//     console.error("Error during login:", err);
//     if (err.response && err.response.status === 503) {
//       return null;
//     } else {
//       throw err;
//     }
//   }
// };

export const login = async (email, password, API_ENDPOINT) => {
  try {
    const url = resolveAuthRequestUrl(API_ENDPOINT);
    const response = await api.post(url, {
      email,
      password,
    });

    const token = response.data.token;

    if (token) {
      localStorage.setItem("user", JSON.stringify(response.data));
      // console.log("Token stored:", token);
    } else {
      throw new Error("User not found or Invalid credentials");
    }

    return response.data;
  } catch (err) {
    console.error("Error during login:", err);
    if (err.response && err.response.status === 503) {
      return null;
    } else {
      throw err;
    }
  }
};

export const signup = async (data, API_ENDPOINT) => {
  try {
    const response = await api.post(API_ENDPOINT, data);
    const token = response.data.token;

    if (token) {
      localStorage.setItem("user", JSON.stringify(response.data));
    } else {
      throw new Error("Invalid credentials");
    }

    return response.data;
  } catch (err) {
    console.error("Error during signup:", err);
    if (err.response && err.response.status === 503) {
      return null;
    } else {
      throw err;
    }
  }
};

export const logout = async (API_ENDPOINT) => {
  try {
    await api.post(API_ENDPOINT);
    localStorage.removeItem("user");
    
  } catch (err) {
    console.error("Error during logout:", err);
    throw err;
  }
};



export const isAuthenticated = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      const decodedToken = jwtDecode(user.token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        // Token has expired
        localStorage.removeItem("user");
        return null;
      }
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error parsing user from localStorage", error);
    localStorage.removeItem("user");
    return null;
  }
};

// export const isAuthenticated = () => {
//   try {
//     const user = JSON.parse(localStorage.getItem("user"));
//     return user && user.token ? user : null;
//   } catch (error) {
//     console.error("Error parsing user from localStorage", error);
//     return null;
//   }
// };

