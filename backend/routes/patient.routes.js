import express from "express";
import fs from "fs";
import multer from "multer";
import {
  addMedicalHistory,
  deleteMedicalHistory,
  editPatientProfile,
  getAllVerifiedTherapists,
  loginPatient,
  logoutPatient,
  resetPassword,
  sendPasswordResetLink,
  signupPatient,
  updateMedicalHistory,
} from "../controllers/patient/patients.controller.js";
import validateToken from "../middleware/validateToken.js";
import {
  createAppointment,
  getAppointments,
  rescheduleAppointment,
} from "../controllers/patient/appointment.controller.js";
import { getNutritionEducationContent } from "../controllers/patient/education.controller.js";
import { getAppointmentDetails } from "../controllers/therapist/appointment.controller.js";
import validateResetToken from "../middleware/validateResetToken.js";

const dir = "/tmp/my-uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

const upload = multer({ storage: storage });

//ROUTES
const router = express.Router();

router.post("/signup", signupPatient);
router.post("/login", loginPatient);

router.post("/forgot-password", sendPasswordResetLink);
router.get("/reset-password/:token", validateResetToken, (req, res) => {
  const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${
    req.params.token
  }`;
  res.redirect(resetUrl);
});

router.post("/reset-password", validateResetToken, resetPassword);

router.use(validateToken);
router.route("/appointments").get(getAppointments).post(createAppointment);
router
  .route("/appointments/:_id")
  .get(getAppointmentDetails)
  .put(rescheduleAppointment);
router.get("/payment-success-page", (req, res) => {
  res.send("Payment successful and appointment updated!");
});

router.route("/therapists").get(getAllVerifiedTherapists);
router.get("/education/nutrition", getNutritionEducationContent);

router.get("/profile", (req, res) => {
  res.json(req.user);
});
router
  .route("/profile")
  .patch(upload.fields([{ name: "profilePicture" }]), editPatientProfile);

router.post("/logout", logoutPatient);

// add medicals
router
  .route("/medical/history")
  .post(addMedicalHistory)
  .patch(updateMedicalHistory)
  .delete(deleteMedicalHistory);

export default router;
