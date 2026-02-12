import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Patient from "../../models/patient.model.js";
import generateToken from "../../utils/generateToken.js";
import Therapist from "../../models/therapist.model.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { sendPasswordResetEmail } from "../../utils/sendGridEmail.js";
import { uploadFilesToCloudinary } from "../../utils/cloudinary.js";

const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id, user.userType, res);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const signupPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      guardianPhoneNumber,
      gender,
      address,
      password,
      dateOfBirth,
      confirmPassword,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (phoneNumber === guardianPhoneNumber) {
      return res.status(400).json({
        message:
          "Guardian phone number cannot be the same as patient phone number",
      });
    }
    const patientByEmail = await Patient.findOne({ email });
    const patientByPhone = await Patient.findOne({ phoneNumber });

    if (patientByEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    if (patientByPhone) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    // HashPassword
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newPatient = new Patient({
      firstName,
      lastName,
      email,
      phoneNumber,
      guardianPhoneNumber,
      gender,
      address,
      dateOfBirth,
      password: hashedPassword,
    });

    if (newPatient) {
      await newPatient.save();
      const user = await Patient.findById(newPatient._id).select("-password");
      createSendToken(user, 201, res);
    } else {
      res
        .status(400)
        .json({ message: "Patient not created, Invalid patient data" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginPatient = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    const patient = await Patient.findOne({
      $or: [{ email }, { phoneNumber }],
    });
    const isPasswordValid = await bcrypt.compare(
      password,
      patient?.password || ""
    );

    if (!patient || !isPasswordValid) {
      return res.status(400).json({
        message:
          "Invalid login patient credentials. Please check your credentials",
      });
    }

    const user = await Patient.findById(patient._id).select("-password");
    createSendToken(user, 200, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const tokenValidation = (req, res) => {
  if (req.user) {
    return res.json({ status: "success", user: req.user });
  } else {
    return res.status(401).json({ status: "error", message: "Invalid token" });
  }
};

export const logoutPatient = (req, res) => {
  try {
    res.clearCookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Patient logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all verified therapists
export const getAllVerifiedTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.find({ isVerified: true }).select(
      "-password"
    );
    res.json({ status: "success", count: therapists.length, data: therapists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a patient's profile
export const getPatientProfile = asyncHandler(async (req, res) => {
  const patientId = req.user._id;

  const patient = await Patient.findById(patientId).select(
    "firstName lastName email gender dateOfBirth age profilePicture phoneNumber guardianPhoneNumber address medicalHistory vitals medications emergencyContact"
  );

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  res.status(200).json({
    status: "success",
    data: patient,
  });
});

export const editPatientProfile = async (req, res) => {
  try {
    const patientId = req.user._id;
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      guardianPhoneNumber,
      address,
      gender,
      dateOfBirth,
      height,
      weight,
      bloodType,
    } = req.body;

    // Update the patient's profile information (except password)
    patient.firstName = firstName || patient.firstName;
    patient.lastName = lastName || patient.lastName;
    patient.email = email || patient.email;
    patient.phoneNumber = phoneNumber || patient.phoneNumber;
    patient.gender = gender || patient.gender;
    patient.guardianPhoneNumber =
      guardianPhoneNumber || patient.guardianPhoneNumber;

    patient.dateOfBirth = dateOfBirth || patient.dateOfBirth;
    const numHeight = Number(height);
    if (height !== undefined && height !== "" && !isNaN(numHeight))
      patient.height = numHeight;
    const numWeight = Number(weight);
    if (weight !== undefined && weight !== "" && !isNaN(numWeight))
      patient.weight = numWeight;
    if (bloodType !== undefined) patient.bloodType = bloodType || null;

    // Update profile picture if provided
    if (req.files && req.files.profilePicture) {
      const profilePicturePath = req.files.profilePicture[0].path;

      const file = [
        { filePath: profilePicturePath, folderName: "profilePicture" },
      ];

      // Upload to Cloudinary
      const uploadPicture = await uploadFilesToCloudinary(file);
      if (uploadPicture) {
        patient.profilePicture = uploadPicture[0].secure_url;
      }
    }

    // Update address if provided
    if (address) {
      patient.address.country = address.country || patient.address.country;
      patient.address.city = address.city || patient.address.city;
      patient.address.district = address.district || patient.address.district;
      patient.address.street = address.street || patient.address.street;
    }

    // Save the updated patient profile
    await patient.save();

    // Exclude the password field from the response
    const updatedPatient = await Patient.findById(patientId).select(
      "-password"
    );

    res
      .status(200)
      .json({ success: "Profile Updated Successfully", updatedPatient });
  } catch (error) {
    console.error("Error updating patient profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// send password reset link to a patient
export const sendPasswordResetLink = async (req, res) => {
  try {
    const { email } = req.body;
    const patient = await Patient.findOne({ email });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const token = jwt.sign(
      {
        userId: patient._id,
        purpose: "password_reset",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const baseUrl =
      process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(patient.email, resetLink);

    res.status(200).json({ message: "Password reset link sent successfully" });
  } catch (error) {
    console.error("Error sending password reset link:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// reset password of a patient
export const resetPassword = async (req, res) => {
  try {
    const patientId = req.user._id;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    patient.password = hashedPassword;
    await patient.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Check if the new password matches the confirm password
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    const patientId = req.user._id;
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Check if the old password is correct
    const isPasswordValid = await bcrypt.compare(oldPassword, patient.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Check if the new password is different from the old password
    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from the current password",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the patient's password
    patient.password = hashedPassword;
    await patient.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Patients medical information
export const addMedicalHistory = asyncHandler(async (req, res) => {
  const { condition, diagnosedDate } = req.body;
  const patientId = req.user._id;

  // Validate diagnosedDate
  const validDate = new Date(diagnosedDate);
  if (isNaN(validDate.getTime())) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  const patient = await Patient.findById(patientId);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  patient.medicalHistory.push({ condition, diagnosedDate: validDate });
  await patient.save();

  res
    .status(200)
    .json({ message: "Medical history added successfully", patient });
});

export const updateMedicalHistory = asyncHandler(async (req, res) => {
  try {
    const { historyId, condition, diagnosedDate } = req.body;
    const patientId = req.user._id;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const history = patient.medicalHistory.id(historyId);
    if (!history) {
      return res.status(404).json({ message: "Medical history not found" });
    }

    history.condition = condition;
    history.diagnosedDate = diagnosedDate;
    await patient.save();
    res
      .status(200)
      .json({ message: "Medical history updated successfully", patient });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e ? e.message : "Internal server error" });
  }
});

export const deleteMedicalHistory = asyncHandler(async (req, res) => {
  try {
    const { historyId } = req.body;
    const patientId = req.user._id;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    patient.medicalHistory.id(historyId).remove();
    await patient.save();
    res
      .status(200)
      .json({ message: "Medical history deleted successfully", patient });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e ? e.message : "Internal server error" });
  }
});
