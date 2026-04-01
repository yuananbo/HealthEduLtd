import express from "express";

import validateToken from "../middleware/validateToken.js";
import { getUpcomingAppointments } from "../controllers/therapist/appointment.controller.js";
import {
  addRating,
  getTherapistRatings,
} from "../controllers/therapist/common.controller.js";
import { getPatientDetails } from "../controllers/therapist/therapist.controller.js";
import { getTherapistDetails } from "../controllers/common.controller.js";

const router = express.Router();

router.use(validateToken);
router.get("/profile", (req, res) => {
  res.json(req.user);
});
// upcoming appointments
router.get("/upcoming-appointments", getUpcomingAppointments);
router.route("/rating/:id").get(getTherapistRatings).post(addRating);
router.get("/therapist/:id", getTherapistDetails);
router.get("/patient/:id", getPatientDetails);
export default router;
