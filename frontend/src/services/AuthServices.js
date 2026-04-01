import api from "../utils/api";
import {jwtDecode} from 'jwt-decode';

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
    const response = await api.post(API_ENDPOINT, {
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

