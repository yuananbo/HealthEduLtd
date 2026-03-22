/**
 * Creates backend/.env from .env.example only if .env does not exist.
 * npm run env:init-payment
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../.env");
const examplePath = path.join(__dirname, "../.env.example");

if (fs.existsSync(envPath)) {
  console.log("backend/.env already exists — not overwriting.");
  console.log("Add payment vars manually or merge from .env.example");
  process.exit(0);
}

if (!fs.existsSync(examplePath)) {
  console.error("Missing backend/.env.example");
  process.exit(1);
}

fs.copyFileSync(examplePath, envPath);
console.log("Created backend/.env from .env.example");
console.log("Next: set Mongo DBCONNECTION + Flutterwave keys + PUBLIC_BACKEND_URL (ngrok).");
console.log("Then: npm run payment:check");
