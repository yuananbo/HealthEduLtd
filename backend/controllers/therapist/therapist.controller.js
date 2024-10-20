import generateToken from "../../utils/generateToken.js";
import Therapist from "../../models/therapist.model.js";
import { uploadFilesToCloudinary } from "../../utils/cloudinary.js";
import { sendEmail } from "../../utils/sendGridEmail.js";
import Patient from "../../models/patient.model.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { signUpTemplate } from "../../utils/emailTemplates.js";
import TherapistRating from "../../models/therapistRating.model.js";
import Appointment from "../../models/appointment.model.js";
import Payment from "../../models/payment.model.js";
import mongoose from "mongoose";

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

export const signupTherapist = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      address,
      profession,
      bio,
      licenseNumber,
      numOfYearsOfExperience,
      specialization,
      password,
      confirmPassword,
    } = req.body;

    // Check if email or phone number is already in use
    const therapistByEmail = await Therapist.findOne({ email });
    const therapistByPhone = await Therapist.findOne({ phoneNumber });

    if (therapistByEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    if (therapistByPhone) {
      return res.status(400).json({ message: "Phone number already in use" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash the password
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);

    // Check for required files
    const profilePicture = req.files.profilePicture
      ? req.files.profilePicture[0]
      : undefined;
    const cv = req.files.cv ? req.files.cv[0] : undefined;
    const licenseDocument = req.files.licenseDocument
      ? req.files.licenseDocument[0]
      : undefined;

    if (!profilePicture || !cv || !licenseDocument) {
      return res
        .status(400)
        .json({ message: "Please upload all required files" });
    }

    // Upload files to Cloudinary
    const files = [
      { filePath: profilePicture.path, folderName: "therapistProfilePictures" },
      { filePath: cv.path, folderName: "therapistCVs" },
      {
        filePath: licenseDocument.path,
        folderName: "therapistLicenseDocuments",
      },
    ];

    const uploadResults = await uploadFilesToCloudinary(files);

    // Create new therapist
    const newTherapist = await Therapist.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      address,
      profession,
      bio,
      licenseNumber,
      numOfYearsOfExperience,
      specialization,
      password,
      profilePicture: uploadResults[0].secure_url,
      cv: uploadResults[1].secure_url,
      licenseDocument: uploadResults[2].secure_url,
      active: false,
      otp: null,
      otpExpires: null,
    });

    // Generate OTP
    const otp = await newTherapist.createOTP();
    await newTherapist.save({ validateBeforeSave: false });

    const baseURL = `${req.protocol}://${req.get("host")}`;

    const verifyLink = `${baseURL}/api/v1/therapist/verify-email?otp=${otp}`;

    // console.log("Verify link:", verifyLink);

    // Send OTP to therapist
    await sendEmail({
      // receipientEmail: newTherapist.email,
      recipientEmail: email,
      subject: "Email Verification Mobirehab",
      template_data: {
        name: firstName,
        otp: otp,
      },
      htmlContent: signUpTemplate({ verifyLink }),
    });

    res.json({
      status: "success",
      message: `OTP sent to ${email}`,
      user: newTherapist,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyAccount = async (req, res) => {
  try {
    const { otp } = req.query;
    const therapist = await Therapist.findOne({
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!therapist) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    therapist.active = true;
    therapist.otp = null;
    therapist.otpExpires = null;

    await therapist.save();
    return res.redirect("/therapist/login");
  } catch (e) {
    console.log(e);
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

// Login therapist
export const loginTherapist = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    // Find therapist by email or phone number
    const therapist = await Therapist.findOne({
      $or: [{ email }, { phoneNumber }],
    }).select("+password");

    // Check if therapist exists
    if (!therapist) {
      return res.status(400).json({
        message: "Invalid login credentials. Please check your credentials.",
      });
    }

    // Compare the entered password with the stored hashed password
    const isPasswordValid = await therapist.matchPassword(password);

    // If password is not valid, return an error
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password." });
    }

    // Check if therapist account is active
    if (!therapist.active) {
      return res.status(400).json({
        message:
          "Account is not active. Please verify your email before logging in.",
      });
    }

    // Send a token to the client
    const user = await Therapist.findByIdAndUpdate(therapist._id).select(
      "-password"
    );
    createSendToken(user, 200, res);
  } catch (error) {
    console.log("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// get patient details by id
export const getPatientDetails = async (req, res) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findById(patientId).select("-password");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ success: "success", data: patient });
  } catch (error) {
    console.error("Error fetching therapist details:", error);
    res.status(500).json({ message: "Internal server error", error: error });
  }
};

/**
 * Update therapist profile
 * @route PATCH /api/v1/therapists/profile
 * @access Private
 */
export const updateTherapistProfile = asyncHandler(async (req, res) => {
  const therapist = await Therapist.findById(req.user._id);

  if (!therapist) {
    res.status(404).json({ message: "Therapist not found" });
  }

  const updatableFields = [
    "firstName",
    "lastName",
    "phoneNumber",
    "alternativePhoneNumber",
    "gender",
    "profession",
    "bio",
    "numOfYearsOfExperience",
    "specialization",
  ];

  const updates = {};

  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Handle nested address field
  if (req.body.address) {
    updates.address = {
      ...therapist.address,
      ...req.body.address,
    };
  }

  // Validate specialization if provided
  if (
    updates.specialization &&
    !Therapist.schema
      .path("specialization")
      .enumValues.includes(updates.specialization)
  ) {
    res.status(400).json({ message: "Invalid specialization" });
  }

  Object.assign(therapist, updates);

  //   console.log('Received data:', req.body);
  // console.log('Updates to be applied:', updates);

  const updatedTherapist = await therapist.save();

  res.json({
    message: "Profile updated successfully",
    therapist: {
      id: updatedTherapist._id,
      firstName: updatedTherapist.firstName,
      lastName: updatedTherapist.lastName,
      email: updatedTherapist.email,
      phoneNumber: updatedTherapist.phoneNumber,
      alternativePhoneNumber: updatedTherapist.alternativePhoneNumber,
      gender: updatedTherapist.gender,
      address: updatedTherapist.address,
      profession: updatedTherapist.profession,
      bio: updatedTherapist.bio,
      numOfYearsOfExperience: updatedTherapist.numOfYearsOfExperience,
      specialization: updatedTherapist.specialization,
      licenseNumber: updatedTherapist.licenseNumber,
      profilePicture: updatedTherapist.profilePicture,
      cv: updatedTherapist.cv,
    },
  });
});

export const getTherapistStatistics = asyncHandler(async (req, res) => {
  // console.log("getTherapistStatistics function called");
  // console.log("Request user:", req.user);

  try {
    const therapistId = req.user._id;
    // console.log("Therapist ID from user object:", therapistId);

    // Check if therapistId is "lstatistics"
    if (therapistId === "lstatistics") {
      console.log("'lstatistics' detected as therapist ID");
      return res
        .status(400)
        .json({ message: "Invalid therapist ID: lstatistics" });
    }

    // Check if therapistId is a valid ObjectId
    // if (!mongoose.Types.ObjectId.isValid(therapistId)) {
    //   console.log("Invalid ObjectId:", therapistId);
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid therapist ID", providedId: therapistId });
    // }

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      console.log("Therapist not found for ID:", therapistId);
      return res.status(404).json({ message: "Therapist not found" });
    }

    // Calculate total patients for the therapist using the appointments collection
    const totalPatients = await Appointment.distinct("patient", {
      therapist: therapistId,
    }).countDocuments();

    const totalAppointments = await Appointment.countDocuments({
      therapist: therapistId,
    });
    // Calculate total income for the therapist using the payments collection and allocate 65% to the therapist and 35% to the platform.
    //The calculation is done using the appointment id to get the total amount paid for the appointment and then summing up the total amount paid for all appointments.
    //Making sure the payment is successfull and the appointment is associated with the therapist.
    const totalIncome = await Payment.aggregate([
      {
        $lookup: {
          from: "appointments",
          localField: "appointment",
          foreignField: "_id",
          as: "appointment",
        },
      },
      { $unwind: "$appointment" },
      {
        $match: {
          "appointment.therapist": new mongoose.Types.ObjectId(therapistId),
          status: "success",
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $multiply: ["$amount", 0.65] } },
        },
      },
    ]);

    const ratings = await TherapistRating.aggregate([
      { $match: { therapist: new mongoose.Types.ObjectId(therapistId) } },
      {
        $group: {
          _id: "$therapist",
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const overallRating = ratings.length > 0 ? ratings[0].averageRating : 0;

    const statistics = {
      totalPatients,
      totalAppointments,
      totalIncome: totalIncome[0] ? totalIncome[0].totalIncome : 0,
      overallRating,
    };

    // console.log("Statistics calculated:", statistics);

    res.json(statistics);
  } catch (error) {
    console.error("Error fetching therapist statistics:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      stack: error.stack,
    });
  }
});
