import express from "express";
import {
  handleFlutterwaveRedirect,
  handleFlutterwaveWebhook,
} from "../controllers/webhook.controller.js";

const router = express.Router();

router.post("/payment/webhook", handleFlutterwaveWebhook);
router.get("/payment-success", handleFlutterwaveRedirect);
export default router;
