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
import DailyCheckIn from "../../models/dailyCheckIn.model.js";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { cloudinary } from "../../utils/cloudinary.js";

const localProfileFilenameFromUrl = (profilePictureUrl) => {
  if (!profilePictureUrl || typeof profilePictureUrl !== "string") return null;
  if (!profilePictureUrl.includes("/uploads/")) return null;
  const part = profilePictureUrl.split("/uploads/")[1];
  if (!part) return null;
  return decodeURIComponent(part.split("?")[0]);
};

const mapCheckInHistory = (checkIns = []) =>
  checkIns.map((checkIn) => ({
    _id: checkIn._id,
    date: checkIn.date,
    painLevel: typeof checkIn.painLevel === "number" ? checkIn.painLevel : null,
    exerciseCompleted:
      typeof checkIn.exerciseCompleted === "boolean"
        ? checkIn.exerciseCompleted
        : null,
    adlIndependence: checkIn.adlIndependence || null,
    bloodPressure: checkIn.bloodPressure || null,
    heartRateBpm:
      typeof checkIn.heartRateBpm === "number" ? checkIn.heartRateBpm : null,
    bloodSugar:
      typeof checkIn?.bloodSugar?.value === "number" ? checkIn.bloodSugar : null,
    weightKg: typeof checkIn.weightKg === "number" ? checkIn.weightKg : null,
    mood: checkIn.mood || null,
    notes: checkIn.notes || "",
  }));

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

const parseAddressFromBody = (raw) => {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === "string" && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      return null;
    }
  }
  return null;
};

export const signupTherapist = async (req, res) => {
  try {
    // Email OTP + verify link only in production. Local/staging: skip (or set SKIP_THERAPIST_EMAIL_OTP=true explicitly).
    const skipTherapistEmailOtp =
      process.env.SKIP_THERAPIST_EMAIL_OTP === "true" ||
      process.env.NODE_ENV !== "production";
    const autoVerifyInDev =
      process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      gender,
      profession,
      bio,
      licenseNumber,
      numOfYearsOfExperience,
      specialization,
      password,
      confirmPassword,
      alternativePhoneNumber,
    } = req.body;

    const address = parseAddressFromBody(req.body.address);
    if (!address) {
      return res.status(400).json({ message: "Valid address is required" });
    }

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

    if (!req.files) {
      return res.status(400).json({
        message:
          "Invalid request: send multipart/form-data with profilePicture, cv, and licenseDocument files",
      });
    }

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

    let profilePictureUrl;
    let cvUrl;
    let licenseUrl;
    let cloudinaryIdForProfile;

    try {
      const uploadResults = await uploadFilesToCloudinary(files);
      profilePictureUrl = uploadResults[0].secure_url;
      cloudinaryIdForProfile = uploadResults[0].public_id;
      cvUrl = uploadResults[1].secure_url;
      licenseUrl = uploadResults[2].secure_url;
    } catch (uploadErr) {
      console.error("Therapist signup upload error:", uploadErr.message || uploadErr);
      const cloudinaryConfigured = Boolean(
        process.env.CLOUD_NAME &&
          (process.env.CLOUD_API_KEY || process.env.CLOUDINARY_API_KEY) &&
          (process.env.CLOUD_API_SECRET || process.env.CLOUDINARY_API_SECRET)
      );
      // Local / staging / missing Cloudinary: store under backend/uploads (503 only when production + Cloudinary expected but failed)
      const allowLocalUploadFallback =
        process.env.ALLOW_LOCAL_SIGNUP_UPLOADS === "true" ||
        process.env.NODE_ENV !== "production" ||
        !cloudinaryConfigured;
      if (!allowLocalUploadFallback) {
        return res.status(503).json({
          message:
            "Could not upload documents. Set CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET in backend/.env, or try again later.",
        });
      }
      const uploadRoot = path.join(
        path.resolve(),
        "backend",
        "uploads",
        "therapist-signup"
      );
      await fs.mkdir(uploadRoot, { recursive: true });
      const host = req.get("host") || "localhost:8000";
      const proto = req.protocol || "http";
      const base = `${proto}://${host}`;

      const copyOne = async (fileMeta) => {
        const ext = path.extname(fileMeta.filePath) || ".bin";
        const name = `${randomUUID()}${ext}`;
        const dest = path.join(uploadRoot, name);
        await fs.copyFile(fileMeta.filePath, dest);
        return `${base}/uploads/therapist-signup/${encodeURIComponent(name)}`;
      };

      profilePictureUrl = await copyOne(files[0]);
      cvUrl = await copyOne(files[1]);
      licenseUrl = await copyOne(files[2]);
      cloudinaryIdForProfile = undefined;
    }

    // Create new therapist
    const newTherapist = await Therapist.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      alternativePhoneNumber:
        alternativePhoneNumber && String(alternativePhoneNumber).trim()
          ? String(alternativePhoneNumber).trim()
          : undefined,
      gender,
      address,
      profession,
      bio,
      licenseNumber,
      numOfYearsOfExperience,
      specialization,
      password,
      profilePicture: profilePictureUrl,
      cloudinaryId: cloudinaryIdForProfile,
      cv: cvUrl,
      licenseDocument: licenseUrl,
      active: skipTherapistEmailOtp ? true : false,
      isVerified:
        skipTherapistEmailOtp && autoVerifyInDev ? true : false,
      otp: null,
      otpExpires: null,
    });

    if (skipTherapistEmailOtp) {
      return res.status(201).json({
        status: "success",
        message: autoVerifyInDev
          ? "Account created (email OTP skipped; dev auto-verified)."
          : "Account created (email OTP skipped). You can log in; admin may still need to approve your profile.",
        user: newTherapist,
      });
    }

    // Generate OTP (production only)
    const otp = await newTherapist.createOTP();
    await newTherapist.save({ validateBeforeSave: false });

    const baseURL = `${req.protocol}://${req.get("host")}`;

    const verifyLink = `${baseURL}/api/v1/therapist/verify-email?otp=${otp}`;

    // console.log("Verify link:", verifyLink);

    try {
      // Send OTP to therapist
      await sendEmail({
        recipientEmail: email,
        subject: "Email Verification Mobirehab",
        template_data: {
          name: firstName,
          otp: otp,
        },
        htmlContent: signUpTemplate({ verifyLink }),
      });

      return res.json({
        status: "success",
        message: `OTP sent to ${email}`,
        user: newTherapist,
      });
    } catch (emailError) {
      console.log("Email sending failed during therapist signup:", emailError);

      if (process.env.NODE_ENV !== "production") {
        return res.status(201).json({
          status: "success",
          message:
            "Account created, but verification email could not be sent. Use verifyLink for local testing.",
          user: newTherapist,
          verifyLink,
          otp,
        });
      }

      return res.status(502).json({
        status: "error",
        message:
          "Account created, but verification email could not be sent. Please contact support.",
      });
    }
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      const parts = Object.values(error.errors || {}).map((e) => e.message);
      return res.status(400).json({
        message: "Validation failed",
        error: parts.join(" ") || error.message,
      });
    }
    res.status(500).json({
      message: "Internal server error",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
      }),
    });
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

    await Therapist.updateOne(
      { _id: therapist._id },
      { $set: { lastLogin: new Date() } }
    );

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

    const [latestDailyCheckIn, recentDailyCheckIns] = await Promise.all([
      DailyCheckIn.findOne({ patient: patientId }).sort({ date: -1 }).lean(),
      DailyCheckIn.find({ patient: patientId })
        .sort({ date: -1 })
        .limit(5)
        .lean(),
    ]);

    const patientData = patient.toObject();
    patientData.latestDailyCheckIn = latestDailyCheckIn;
    patientData.healthIndicators = {
      bloodPressure: latestDailyCheckIn?.bloodPressure || null,
      bloodPressureDate: latestDailyCheckIn?.date || null,
      recentHistory: mapCheckInHistory(recentDailyCheckIns),
    };

    res.status(200).json({ success: "success", data: patientData });
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
    return res.status(404).json({ message: "Therapist not found" });
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

  let addressPayload = req.body.address;
  if (typeof addressPayload === "string") {
    try {
      addressPayload = JSON.parse(addressPayload);
    } catch {
      addressPayload = undefined;
    }
  }
  if (addressPayload && typeof addressPayload === "object") {
    const rawAddr = therapist.address;
    const addrPlain =
      rawAddr && typeof rawAddr.toObject === "function"
        ? rawAddr.toObject()
        : { ...(rawAddr || {}) };
    updates.address = { ...addrPlain, ...addressPayload };
  }

  // Validate specialization if provided
  if (
    updates.specialization &&
    !Therapist.schema
      .path("specialization")
      .enumValues.includes(updates.specialization)
  ) {
    return res.status(400).json({ message: "Invalid specialization" });
  }

  Object.assign(therapist, updates);

  const profileFile = req.files?.profilePicture?.[0];
  if (profileFile?.path) {
    const uploadsDir = path.join(process.cwd(), "backend", "uploads");
    const newBasename = path.basename(profileFile.path);

    if (therapist.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(therapist.cloudinaryId);
      } catch (destroyErr) {
        console.warn("Could not remove previous Cloudinary profile image:", destroyErr);
      }
      therapist.cloudinaryId = undefined;
    }

    const previousLocalName = localProfileFilenameFromUrl(therapist.profilePicture);
    if (previousLocalName && previousLocalName !== newBasename) {
      try {
        await fs.unlink(path.join(uploadsDir, previousLocalName));
      } catch (unlinkErr) {
        console.warn("Could not remove previous local profile image:", unlinkErr);
      }
    }

    const localUrl = `${req.protocol}://${req.get("host")}/uploads/${encodeURIComponent(
      newBasename
    )}`;
    therapist.profilePicture = localUrl;
  }

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
    const uniquePatients = await Appointment.distinct("patient", {
      therapist: therapistId,
    });
    const totalPatients = uniquePatients.length;

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

    /**
     * Design Pattern: Facade
     * Why here: Therapist dashboard needs data from multiple modules/models
     * (Appointment, Payment, TherapistRating, Patient) but frontend should call only one API.
     * Problem solved: avoids multiple client requests and duplicated data-merge logic in UI.
     * Extensibility/Maintainability: new dashboard metrics can be added inside this facade
     * without changing frontend call flow or route structure.
     */
    const now = new Date();
    const monthWindow = 6;
    const startMonth = new Date(now.getFullYear(), now.getMonth() - (monthWindow - 1), 1);

    const monthlyRows = await Appointment.aggregate([
      {
        $match: {
          therapist: new mongoose.Types.ObjectId(therapistId),
          date: { $gte: startMonth },
          status: { $nin: ["Declined", "Cancelled"] },
        },
      },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "appointment",
          as: "payments",
        },
      },
      {
        $addFields: {
          successfulPaymentTotal: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$payments",
                    as: "payment",
                    cond: { $eq: ["$$payment.status", "success"] },
                  },
                },
                as: "payment",
                in: "$$payment.amount",
              },
            },
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          appointments: { $sum: 1 },
          uniquePatients: { $addToSet: "$patient" },
          income: { $sum: { $multiply: ["$successfulPaymentTotal", 0.65] } },
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          appointments: 1,
          patients: { $size: "$uniquePatients" },
          income: { $round: ["$income", 2] },
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthKeyToData = new Map(
      monthlyRows.map((row) => [`${row.year}-${String(row.month).padStart(2, "0")}`, row])
    );

    /**
     * Design Pattern: Adapter (DTO mapper)
     * Why here: aggregation output uses DB-centric shapes, while chart/table need UI-centric fields.
     * Problem solved: decouples database pipeline format from frontend component contract.
     * Extensibility/Maintainability: schema or aggregation changes stay localized in this mapper;
     * dashboard components can remain stable as long as DTO shape is preserved.
     */
    const performanceOverview = Array.from({ length: monthWindow }, (_, idx) => {
      const target = new Date(startMonth.getFullYear(), startMonth.getMonth() + idx, 1);
      const year = target.getFullYear();
      const month = target.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;
      const row = monthKeyToData.get(key);
      return {
        month: monthLabels[target.getMonth()],
        patients: row?.patients || 0,
        appointments: row?.appointments || 0,
        income: row?.income || 0,
      };
    });

    const patientRows = await Appointment.aggregate([
      {
        $match: {
          therapist: new mongoose.Types.ObjectId(therapistId),
          status: { $nin: ["Declined", "Cancelled"] },
        },
      },
      {
        $group: {
          _id: "$patient",
          lastVisit: { $max: "$date" },
        },
      },
      { $sort: { lastVisit: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "patients",
          localField: "_id",
          foreignField: "_id",
          as: "patientInfo",
        },
      },
      { $unwind: "$patientInfo" },
      {
        $project: {
          _id: 1,
          firstName: "$patientInfo.firstName",
          lastName: "$patientInfo.lastName",
          age: "$patientInfo.age",
          dateOfBirth: "$patientInfo.dateOfBirth",
          lastVisit: 1,
        },
      },
    ]);

    const getAge = (age, dateOfBirth) => {
      if (typeof age === "number" && !Number.isNaN(age)) return age;
      if (!dateOfBirth) return null;
      const dob = new Date(dateOfBirth);
      if (Number.isNaN(dob.getTime())) return null;
      let years = now.getFullYear() - dob.getFullYear();
      const hasNotHadBirthdayThisYear =
        now.getMonth() < dob.getMonth() ||
        (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
      if (hasNotHadBirthdayThisYear) years -= 1;
      return years >= 0 ? years : null;
    };

    const recentPatients = patientRows.map((patient) => ({
      id: patient._id,
      name: `${patient.firstName} ${patient.lastName}`,
      age: getAge(patient.age, patient.dateOfBirth),
      lastVisit: patient.lastVisit,
    }));

    const statistics = {
      totalPatients,
      totalAppointments,
      totalIncome: totalIncome[0] ? totalIncome[0].totalIncome : 0,
      overallRating,
      performanceOverview,
      recentPatients,
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
