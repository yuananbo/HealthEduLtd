/**
 * Set every Availability document to: today → +6 days (UTC), default mock time slots (all active).
 * Use when old mock dates are in the past and you need slots to test booking/payment.
 *
 *   node backend/scripts/refreshMockAvailabilities.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Availability from "../models/availability.model.js";
import { buildRolling7DayAvailabilitiesUTC } from "./availabilityRolling.util.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const TIMES = ["09:00", "10:00", "11:00", "14:00", "15:00"];

async function main() {
  if (!process.env.DBCONNECTION) {
    throw new Error("Missing DBCONNECTION in backend/.env");
  }

  await mongoose.connect(process.env.DBCONNECTION);
  const availabilities = buildRolling7DayAvailabilitiesUTC(TIMES);

  const result = await Availability.updateMany(
    {},
    { $set: { availabilities } }
  );

  console.log(
    `Updated ${result.modifiedCount} availability document(s). Dates (UTC):`,
    availabilities[0].date.toISOString().slice(0, 10),
    "→",
    availabilities[6].date.toISOString().slice(0, 10)
  );
}

main()
  .then(() => mongoose.disconnect().then(() => process.exit(0)))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
