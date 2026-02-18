import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const medicalHistorySchema = new mongoose.Schema({
  condition: String,
  diagnosedDate: Date
});

const vitalSchema = new mongoose.Schema({
  type: String,
  value: String,
  unit: String
});

const medicationSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  frequency: String
});

const patientSchema = new mongoose.Schema(
  {
    patientId: {
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
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female"],
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    age: {
      type: Number,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    cloudinaryId: {
      type: String,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    guardianPhoneNumber: {
      type: String,
      required: true,
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
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    userType: {
      type: String,
      default: "patient",
    },
    medicalHistory: [medicalHistorySchema],
    vitals: [vitalSchema],
    medications: [medicationSchema],
    emergencyContact: {
      type: String,
    },
    height: {
      type: Number,
      default: null,
    },
    weight: {
      type: Number,
      default: null,
    },
    bloodType: {
      type: String,
      default: null,
    },
    savedEducationContents: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

patientSchema.pre("save", function (next) {
  if (!this.patientId) {
    this.patientId = generatePatientId();
  }
  next();
});

function generatePatientId() {
  let id = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 8; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
}


patientSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;