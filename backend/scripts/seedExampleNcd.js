import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import EducationContent from "../models/educationContent.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const exampleContent = {
  topic: "ncd-management",
  type: "article",
  title: "Sample1",
  summary: "This is a summary.",
  duration: "8 min read",
  body: `This is the article. balabalabalabalahhhhhhhbalabala...`,
  sourceName: "Health Education Platform",
  sourceUrl: "https://example.com/ncd-management",
  isPublished: true,
  order: 0,
};

const seedExampleContent = async () => {
  try {
    await mongoose.connect(process.env.DBCONNECTION);

    const result = await EducationContent.findOneAndUpdate(
      { topic: exampleContent.topic, title: exampleContent.title },
      exampleContent,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log("Example NCD content seeded successfully!");
    console.log("Content ID:", result._id);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed example content:", error);
    process.exit(1);
  }
};

seedExampleContent();
