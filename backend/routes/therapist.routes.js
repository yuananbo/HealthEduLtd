import express from "express";
import validateToken from "../middleware/validateToken.js";
import { checkPasswordStrength } from "../middleware/checkPasswordStrength.js";
import {
  getPatientDetails,
  getTherapistStatistics,
  loginTherapist,
  signupTherapist,
  updateTherapistProfile,
  verifyAccount,
} from "../controllers/therapist/therapist.controller.js";
import fs from "fs";
import multer from "multer";
import path from "path";
import {
  addAppointmentNotes,
  deleteAppointment,
  getAppointmentDetails,
  getAppointments,
  updateAppointmentStatus,
} from "../controllers/therapist/appointment.controller.js";
import {
  createAvailabilityController,
  deleteAvailability,
  getAllAvailabilitiesController,
  getAvailabilityController,
  getMyAvailabilities,
  setAvailabilityActive,
  setAvailabilityInactive,
  updateMyAvailabilityTimeSlotStatus,
  updateAvailabilityTimeSlot,
  updateMyAvailability,
} from "../controllers/therapist/availability.controller.js";
import { getTherapistProfileWithRatings } from "../controllers/therapist/common.controller.js";

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

const MAX_SIGNUP_FILE_MB = 25;
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_SIGNUP_FILE_MB * 1024 * 1024,
    files: 6,
  },
});

const profileUploadsDir = path.join(process.cwd(), "backend", "uploads");
if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir, { recursive: true });
}

const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileUploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || "");
    cb(null, "therapist-profile-" + Date.now() + ext);
  },
});

const uploadProfilePicture = multer({ storage: profilePictureStorage });

//ROUTES
const router = express.Router();
router.post(
  "/signup",
  upload.fields([
    { name: "profilePicture" },
    { name: "cv" },
    { name: "licenseDocument" },
  ]),
  checkPasswordStrength,
  signupTherapist
);

router.get("/verify-email", verifyAccount);
router.post("/login", loginTherapist);

router.use(validateToken);
router.route("/appointments").get(getAppointments);
router
  .route("/appointments/:_id")
  .get(getAppointmentDetails)
  .patch(updateAppointmentStatus)
  .delete(deleteAppointment);

router.route("/appointments/:id/notes").post(addAppointmentNotes);

router
  .route("/availability")
  .get(getAvailabilityController)
  .post(createAvailabilityController);

router
  .route("/availability/:id")
  .get(getAllAvailabilitiesController)
  .put(updateAvailabilityTimeSlot);
router.get("/my-availability", getMyAvailabilities);
router
  .route("/my-availability/:id")
  .patch(updateMyAvailability)
  .delete(deleteAvailability);
router.patch(
  "/my-availability/:id/timeslot",
  updateMyAvailabilityTimeSlotStatus
);
router.put("/my-availability/:availabilityId/activate", setAvailabilityActive);
router.put(
  "/my-availability/:availabilityId/deactivate",
  setAvailabilityInactive
);

router.route("/my-statistics").get(getTherapistStatistics);

router
  .route("/profile")
  .get(getTherapistProfileWithRatings)
  .patch(
    uploadProfilePicture.fields([{ name: "profilePicture", maxCount: 1 }]),
    updateTherapistProfile
  );

export default router;
