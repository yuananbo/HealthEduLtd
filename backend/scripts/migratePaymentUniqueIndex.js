/**
 * One-time: replace payments.appointment unique index with (appointment + purpose).
 * Fixes E11000 when saving consultation Payment after a registration Payment exists.
 *
 * Usage: node backend/scripts/migratePaymentUniqueIndex.js
 * Requires DBCONNECTION in backend/.env
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Payment from "../models/payment.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
  if (!process.env.DBCONNECTION) {
    console.error("Set DBCONNECTION in backend/.env");
    process.exit(1);
  }
  await mongoose.connect(process.env.DBCONNECTION);
  const coll = Payment.collection;

  const indexes = await coll.indexes();
  for (const idx of indexes) {
    const k = idx.key || {};
    const keys = Object.keys(k);
    if (
      idx.unique &&
      keys.length === 1 &&
      k.appointment === 1
    ) {
      try {
        await coll.dropIndex(idx.name);
        console.log("Dropped index:", idx.name);
      } catch (e) {
        console.warn("Drop failed:", idx.name, e.message);
      }
    }
  }

  await coll.createIndex(
    { appointment: 1, purpose: 1 },
    { unique: true }
  );
  console.log("Created unique index { appointment: 1, purpose: 1 }");
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
