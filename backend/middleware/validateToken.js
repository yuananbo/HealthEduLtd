import jwt from "jsonwebtoken";
import Patient from "../models/patient.model.js";
import Therapist from "../models/therapist.model.js";
import Admin from "../models/admin.model.js";

const validateToken = async (req, res, next) => {
  try {
    // Try cookie first, then fallback to Authorization header.
    let token = req.cookies.jwt;

    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token)
      return res
        .status(401)
        .json({ message: "Unauthorized - no token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res.status(401).json({ message: "Unauthorized - invalid token" });

    let user;
    switch (decoded.userType) {
      case "patient":
        user = await Patient.findById(decoded.userId).select("-password");
        break;
      case "therapist":
        user = await Therapist.findById(decoded.userId).select("-password");
        break;
      case "admin":
        user = await Admin.findById(decoded.userId).select("-password");
        break;
      default:
        return res
          .status(401)
          .json({ message: "Unauthorized - invalid token" });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default validateToken;
