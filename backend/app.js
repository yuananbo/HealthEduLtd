import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __currentDir = dirname(__filename);

// Load .env from backend directory
config({ path: path.join(__currentDir, ".env") });
import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerOptions from "./utils/swaggerOptions.js";
import patientRoutes from "./routes/patient.routes.js";
import therapistRoutes from "./routes/therapist.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import commonRoutes from "./routes/common.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import adminSetupRoutes from "./routes/setupAdmin.routes.js";

const app = express();

const __dirname = path.resolve();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// app.get("/", (req, res) => res.send("Welcome to MOBIREHAB API"));

//PATIENT ROUTES
app.use("/api/v1/patient", patientRoutes);
app.use("/api/v1/therapist", therapistRoutes);
app.use("/api/v1/", webhookRoutes);
app.use("/api/v1/", commonRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/setup/", adminSetupRoutes);

//Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerJsdoc(swaggerOptions), { explorer: true })
);

// Serve static assets if in production
app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

// NOT FOUND ROUTE
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    success: false,
    message: err.message || "An unexpected error occurred",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

export default app;
