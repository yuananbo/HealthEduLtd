import rateLimit from "express-rate-limit";

export const setupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skip: () => process.env.NODE_ENV !== "production",
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
});
