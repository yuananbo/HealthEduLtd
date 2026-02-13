import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import EducationContent from "../models/educationContent.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const nutritionSeedData = [
  {
    topic: "nutrition",
    type: "article",
    title: "Healthy Diet",
    summary:
      "Key recommendations for healthy eating patterns across the lifespan.",
    duration: "6 min read",
    body: "This resource outlines practical dietary guidance such as increasing vegetables, fruit, legumes, and whole grains while reducing free sugars, salt, and unhealthy fats.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl:
      "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
    isPublished: true,
    order: 1,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "The Eatwell Guide",
    summary:
      "How to balance food groups for everyday meals and long-term health.",
    duration: "7 min read",
    body: "The guide explains proportions of different food groups to include in daily meals and highlights simple ways to improve dietary balance.",
    sourceName: "NHS",
    sourceUrl:
      "https://www.nhs.uk/live-well/eat-well/food-guidelines-and-food-labels/the-eatwell-guide/",
    isPublished: true,
    order: 2,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "Nutrition",
    summary:
      "A broad patient-friendly nutrition overview with links to trusted subtopics.",
    duration: "5 min read",
    body: "This page provides a high-level introduction to nutrition and curated references for vitamins, minerals, healthy eating patterns, and specific health conditions.",
    sourceName: "MedlinePlus",
    sourceUrl: "https://medlineplus.gov/nutrition.html",
    isPublished: true,
    order: 3,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "AHA Diet and Lifestyle Recommendations",
    summary:
      "Heart-healthy nutrition and lifestyle practices for risk reduction.",
    duration: "8 min read",
    body: "The American Heart Association shares practical recommendations on dietary patterns, sodium, sugar, and physical activity to support cardiovascular health.",
    sourceName: "American Heart Association",
    sourceUrl:
      "https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/nutrition-basics/aha-diet-and-lifestyle-recommendations",
    isPublished: true,
    order: 4,
  },
  {
    topic: "nutrition",
    type: "video",
    title: "MyPlate, MyWins: What's Your Healthy Eating Style?",
    summary:
      "A short introduction to building healthier eating habits with MyPlate.",
    duration: "2 min watch",
    body: "This USDA MyPlate video introduces simple, actionable changes people can make to improve meal quality and maintain healthier eating routines.",
    sourceName: "USDA MyPlate (YouTube)",
    sourceUrl: "https://www.youtube.com/watch?v=j7CcaUZrUoE",
    isPublished: true,
    order: 5,
  },
];

const seedNutritionEducation = async () => {
  try {
    await mongoose.connect(process.env.DBCONNECTION);

    for (const item of nutritionSeedData) {
      await EducationContent.findOneAndUpdate(
        { topic: item.topic, title: item.title },
        item,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log(
      `Nutrition education content seeded: ${nutritionSeedData.length} records`
    );
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed nutrition education content:", error);
    process.exit(1);
  }
};

seedNutritionEducation();
