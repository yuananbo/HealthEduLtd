import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    admindId: {
      type: String,
    },
    firstName: {
      type: String,
      default: "Admin",
    },
    lastName: {
      type: String,
      default: "Mobirehab",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      immutable: true,
    },

    phoneNumber: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      default: "admin",
      immutable: true,
    },
    profilePicture: {
      type: String,
    },
    role: {
      type: String,
      default: "admin",
      enum: ["admin", "super-admin"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    cloudinaryId: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    permissions: [
      {
        type: String,
        enum: [
          "verifyTherapist",
          "suspendTherapist",
          "viewTherapistActivities",
          "payTherapist",
          "createAdmin",
          "deleteAccount",
          "viewPatientProfiles",
        ],
      },
    ],
    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Number,
    },

    twoFactorSecret: {
      type: String,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Generate adminId
adminSchema.pre("save", async function (next) {
  if (!this.admindId) {
    this.admindId =
      "ADM" + Math.random().toString(36).substring(7).toUpperCase();
  }
  next();
});

// set permissions based on role
adminSchema.pre("save", function (next) {
  if (this.role === "super-admin") {
    this.permissions = [
      "verifyTherapist",
      "suspendTherapist",
      "viewTherapistActivities",
      "payTherapist",
      "createAdmin",
      "deleteAccount",
      "viewPatientProfiles",
    ];
  } else {
    this.permissions = [
      "verifyTherapist",
      "suspendTherapist",
      "viewTherapistActivities",
      "payTherapist",
      "viewPatientProfiles",
    ];
  }
  next();
});

// password hashing
adminSchema.pre("save", async function (next) {
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
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to handle failed login attempts
adminSchema.methods.incrementLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    updates.$set = { lockUntil: Date.now() + 1800000 };
  }
  return this.updateOne(updates);
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
