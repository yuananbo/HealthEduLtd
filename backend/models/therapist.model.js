import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const therapistSchema = new mongoose.Schema(
  {
    therapistId: {
      type: String,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    alternativePhoneNumber: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    address: {
      country: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      district: {
        type: String,
      },
      street: {
        type: String,
      },
    },
    profession: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
    numOfYearsOfExperience: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
      enum: [
        "Physiotherapist",
        "Occupational Therapist",
        "Prosthetist and Orthotist",
        "Nurse",
        "Nutritionist",
        "Counsellor",
        "Medical Doctor",
      ],
    },
    licenseNumber: {
      type: String,
      required: true,
    },
    licenseDocument: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    cloudinaryId: {
      type: String,
    },
    cv: {
      type: String,
      default: "",
    },
    cvCloudinaryId: {
      type: String,
    },
    userType: {
      type: String,
      default: "therapist",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    ratings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TherapistRating",
      },
    ],
    password: {
      type: String,
      required: true,
      select: false, // Ensure password is not selected by default
    },
  },
  { timestamps: true }
);

therapistSchema.pre("save", async function (next) {
  if (!this.therapistId) {
    this.therapistId = generateTherapistId();
  }
  next();
});

// password hashing
therapistSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// compare password
therapistSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

function generateTherapistId() {
  let id = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 8; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
}

therapistSchema.methods.createOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // Increase time
  return otp;
};

const Therapist = mongoose.model("Therapist", therapistSchema);

export default Therapist;
