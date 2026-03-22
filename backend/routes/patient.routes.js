import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  addMedicalHistory,
  deleteMedicalHistory,
  deletePrescription,
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
  cancelAppointment,
  rescheduleAppointment,
  initiateAppointmentPayment,
  initiateConsultationPayment,
} from "../controllers/patient/appointment.controller.js";
import {
  getEducationContentByTopic,
  saveEducationContent,
  getSavedEducationContent,
  submitQuestionnaire,
} from "../controllers/patient/education.controller.js";
import {
  getMyCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/patient/cart.controller.js";
import {
  getMyDailyCheckIns,
  getMyLatestDailyCheckIn,
  upsertDailyCheckIn,
} from "../controllers/patient/monitoring.controller.js";
import { getAppointmentDetails } from "../controllers/therapist/appointment.controller.js";
import validateResetToken from "../middleware/validateResetToken.js";

const dir = path.join(process.cwd(), "backend", "uploads");

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "");
    cb(null, file.fieldname + "-" + Date.now() + ext);
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
router.post("/appointments/:_id/pay", initiateAppointmentPayment);
router.post(
  "/appointments/:_id/pay-consultation",
  initiateConsultationPayment
);
router.route("/appointments").get(getAppointments).post(createAppointment);
router
  .route("/appointments/:_id")
  .get(getAppointmentDetails)
  .put(rescheduleAppointment);
router.patch("/appointments/:_id/cancel", cancelAppointment);
router.get("/payment-success-page", (req, res) => {
  res.send("Payment successful and appointment updated!");
});

router.route("/therapists").get(getAllVerifiedTherapists);
router.get("/education/content", getEducationContentByTopic);
router.post("/education/save", saveEducationContent);
router.get("/education/saved", getSavedEducationContent);
router.post("/education/questionnaire", submitQuestionnaire);

// Cart
router
  .route("/cart")
  .get(getMyCart)
  .post(addToCart)
  .delete(clearCart);
router.route("/cart/:deviceId").patch(updateCartItem).delete(removeCartItem);

router.get("/profile", (req, res) => {
  res.json(req.user);
});
router
  .route("/profile")
  .patch(
    upload.fields([{ name: "profilePicture" }, { name: "prescription" }]),
    editPatientProfile
  );

router.delete("/profile/prescriptions/:prescriptionId", deletePrescription);

router.post("/logout", logoutPatient);

// Monitoring / daily check-ins
router
  .route("/monitoring/checkins")
  .get(getMyDailyCheckIns)
  .post(upsertDailyCheckIn);
router.get("/monitoring/checkins/latest", getMyLatestDailyCheckIn);

// add medicals
router
  .route("/medical/history")
  .post(addMedicalHistory)
  .patch(updateMedicalHistory)
  .delete(deleteMedicalHistory);

export default router;
