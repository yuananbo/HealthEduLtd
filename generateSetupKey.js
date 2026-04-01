import dotenv from "dotenv";
import { generateAndSaveSetupKey } from "./backend/utils/generateAndSaveSetupKey.js";

dotenv.config();

async function main() {
  try {
    const setupKey = await generateAndSaveSetupKey();
    console.log("Setup key generated and saved to .env file");
    console.log("Use this setup key to create the super admin:", setupKey);
    console.log("Keep this key secure and do not share it publicly.");
  } catch (error) {
    console.error("Error generating setup key:", error);
  }
}

main();
