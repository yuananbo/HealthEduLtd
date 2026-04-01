// utils/generateSetupKey.js
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function generateAndSaveSetupKey() {
  const setupKey = crypto.randomBytes(32).toString("hex");
  const envPath = path.resolve(__dirname, "../../.env");

  try {
    let envContent = await fs.readFile(envPath, "utf8");
    if (envContent.includes("SETUP_KEY=")) {
      envContent = envContent.replace(/SETUP_KEY=.*/, `SETUP_KEY=${setupKey}`);
    } else {
      envContent += `\nSETUP_KEY=${setupKey}`;
    }
    await fs.writeFile(envPath, envContent);
    return setupKey;
  } catch (error) {
    console.error("Error saving setup key:", error);
    throw error;
  }
}
