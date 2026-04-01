// import jwt from "jsonwebtoken";
// import Patient from "../models/patient.model.js";
// import Therapist from "../models/therapist.model.js";

// const validateResetToken = async (req, res, next) => {
//   try {
//     // Get the token from the request parameters or body
//     const token = req.params.token || req.body.token;
//     if (!token) {
//       return res.status(401).json({ message: "No reset token provided" });
//     }

//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
//     if (!decoded) {
//       return res.status(401).json({ message: "Invalid reset token" });
//     }

//     // Check if the token is for password reset
//     if (decoded.purpose !== 'password_reset') {
//       return res.status(401).json({ message: "Invalid token purpose" });
//     }

//     // Find the user (patient or therapist)
//     let user;
//     if (decoded.userType === 'patient') {
//       user = await Patient.findById(decoded.userId).select("-password");
//     } else if (decoded.userType === 'therapist') {
//       user = await Therapist.findById(decoded.userId).select("-password");
//     } else {
//       return res.status(401).json({ message: "Invalid user type" });
//     }

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Attach the user to the request object
//     req.user = user;
//     req.userType = decoded.userType;

//     next();
//   } catch (error) {
//     console.error(error);
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ message: "Reset token has expired" });
//     }
//     res.status(500).json({ message: "Error validating reset token" });
//   }
// };

// export default validateResetToken;

import jwt from "jsonwebtoken";
import Patient from "../models/patient.model.js";

const validateResetToken = async (req, res, next) => {
  try {
    // Get the token from the request parameters or body
    const token = req.params.token || req.body.token;

    if (!token) {
      return res.status(401).json({ message: "No reset token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid reset token" });
    }

    // Check if the token is for password reset
    if (decoded.purpose !== 'password_reset') {
      return res.status(401).json({ message: "Invalid token purpose" });
    }

    // Find the patient
    const patient = await Patient.findById(decoded.userId).select("-password");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Attach the patient to the request object
    req.user = patient;

    next();
  } catch (error) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Reset token has expired" });
    }
    res.status(500).json({ message: "Error validating reset token" });
  }
};

export default validateResetToken;