import express from "express";
import { checkSetupKey } from "../middleware/checkSetupKey.js";
import { checkPasswordStrength } from "../middleware/checkPasswordStrength.js";
import { createSuperAdmin } from "../controllers/admin/admin.controller.js";
import { checkRouteIsEnabled } from "../middleware/checkRouteIsEnabled.js";

const router = express.Router();

// Public route for creating super admin
router
  .route("/create-super-admin")
  .post(
    checkRouteIsEnabled,
    checkSetupKey,
    checkPasswordStrength,
    createSuperAdmin
  );

export default router;
