import express from "express";
import { checkSetupKey } from "../middleware/checkSetupKey.js";
import { checkPasswordStrength } from "../middleware/checkPasswordStrength.js";
import {
  approveTherapist,
  createAdminContent,
  getAdminContentById,
  createAdmin,
  createSuperAdmin,
  disapproveTherapist,
  getAdminContents,
  getAllTherapists,
  getTherapistAppointments,
  getTherapistById,
  getTherapistStats,
  loginAdmin,
  logoutAdmin,
  updateAdminContent,
  updateAdminContentStatus,
} from "../controllers/admin/admin.controller.js";
import validateToken from "../middleware/validateToken.js";
import { checkRouteIsEnabled } from "../middleware/checkRouteIsEnabled.js";
import { setupLimiter } from "../utils/setUpLimiter.js";

const router = express.Router();

// Public route for creating super admin
router
  .route("/setup/create-super-admin")
  .post(
    checkRouteIsEnabled,
    checkSetupKey,
    checkPasswordStrength,
    createSuperAdmin
  );

// login admin route
router.route("/login").post(setupLimiter, loginAdmin);

// Protected admin routes
router.use(validateToken);
router.route("/create").post(checkPasswordStrength, createAdmin);
router.route("/content").get(getAdminContents).post(createAdminContent);
router.route("/content/:id").get(getAdminContentById).patch(updateAdminContent);
router.route("/content/:id/status").patch(updateAdminContentStatus);
router.route("/therapists").get(getAllTherapists);
router.route("/therapists/:id").get(getTherapistById);
router.route("/therapists/:id/stats").get(getTherapistStats);
router.route("/therapists/approve/:id").patch(approveTherapist);
router.route("/therapists/disapprove/:id").patch(disapproveTherapist);
router.route("/therapists/:id/appointments").get(getTherapistAppointments);

router.post("/logout", logoutAdmin);

export default router;
