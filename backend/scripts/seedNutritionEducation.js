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
  {
    topic: "nutrition",
    type: "article",
    title: "What Is MyPlate?",
    summary:
      "USDA MyPlate basics for building balanced meals with practical visuals.",
    duration: "4 min read",
    body: "This guide explains the MyPlate framework and how to proportion vegetables, fruits, grains, protein foods, and dairy in a practical daily meal pattern.",
    sourceName: "USDA MyPlate",
    sourceUrl: "https://www.myplate.gov/eat-healthy/what-is-myplate",
    isPublished: true,
    order: 6,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "Dietary Guidelines for Americans",
    summary:
      "Evidence-based recommendations for healthy dietary patterns and nutrition.",
    duration: "6 min read",
    body: "The Dietary Guidelines provide population-level recommendations to support health, reduce chronic disease risk, and meet nutrient needs across life stages.",
    sourceName: "DietaryGuidelines.gov",
    sourceUrl: "https://www.dietaryguidelines.gov/",
    isPublished: true,
    order: 7,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "CDC Nutrition",
    summary:
      "Public health nutrition resources for healthy eating and chronic disease prevention.",
    duration: "5 min read",
    body: "CDC nutrition resources cover dietary patterns, sodium reduction, and nutrition strategies that support prevention and management of chronic conditions.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/nutrition/index.html",
    isPublished: true,
    order: 8,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "DASH Eating Plan",
    summary:
      "Nutrition pattern designed to support blood pressure and cardiovascular health.",
    duration: "7 min read",
    body: "The DASH approach focuses on vegetables, fruits, low-fat dairy, whole grains, and lean proteins while limiting sodium and saturated fats.",
    sourceName: "National Heart, Lung, and Blood Institute (NHLBI)",
    sourceUrl: "https://www.nhlbi.nih.gov/education/dash-eating-plan",
    isPublished: true,
    order: 9,
  },
  {
    topic: "nutrition",
    type: "video",
    title: "MyPlate, MyWins: Make Half Your Plate Fruits and Vegetables",
    summary:
      "Quick USDA nutrition message on increasing fruit and vegetable intake.",
    duration: "1 min watch",
    body: "A short MyPlate video introducing one of the simplest high-impact nutrition habits: making half your plate fruits and vegetables.",
    sourceName: "USDA MyPlate (YouTube)",
    sourceUrl: "https://www.youtube.com/watch?v=8qR9QzP6G8w",
    isPublished: true,
    order: 10,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "Fruits",
    summary: "MyPlate guidance on choosing and preparing fruit options.",
    duration: "4 min read",
    body: "This page explains fruit group recommendations, serving examples, and practical ways to include more whole fruits in daily meals.",
    sourceName: "USDA MyPlate",
    sourceUrl: "https://www.myplate.gov/eat-healthy/fruits",
    isPublished: true,
    order: 11,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "Vegetables",
    summary: "MyPlate recommendations for vegetable variety and portions.",
    duration: "4 min read",
    body: "Covers vegetable subgroups, serving ideas, and tips for increasing vegetable intake across meals and snacks.",
    sourceName: "USDA MyPlate",
    sourceUrl: "https://www.myplate.gov/eat-healthy/vegetables",
    isPublished: true,
    order: 12,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "Grains",
    summary: "How to choose whole grains and improve grain quality in meals.",
    duration: "4 min read",
    body: "Describes whole vs refined grains and practical substitutions to increase fiber and nutrient intake.",
    sourceName: "USDA MyPlate",
    sourceUrl: "https://www.myplate.gov/eat-healthy/grains",
    isPublished: true,
    order: 13,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "Protein Foods",
    summary: "Protein choices and balanced intake recommendations.",
    duration: "4 min read",
    body: "Outlines protein food options including seafood, lean meat, beans, peas, nuts, and seeds with guidance on variety.",
    sourceName: "USDA MyPlate",
    sourceUrl: "https://www.myplate.gov/eat-healthy/protein-foods",
    isPublished: true,
    order: 14,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "Dairy",
    summary: "Guidance on dairy and fortified alternatives in healthy eating.",
    duration: "4 min read",
    body: "Explains recommended dairy choices, serving examples, and nutrient considerations for calcium and vitamin D.",
    sourceName: "USDA MyPlate",
    sourceUrl: "https://www.myplate.gov/eat-healthy/dairy",
    isPublished: true,
    order: 15,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "Eating a Balanced Diet",
    summary: "NHS practical advice for balanced meals and healthy choices.",
    duration: "6 min read",
    body: "Provides meal composition guidance, food group balance, and day-to-day actions to support healthier dietary habits.",
    sourceName: "NHS",
    sourceUrl:
      "https://www.nhs.uk/live-well/eat-well/how-to-eat-a-balanced-diet/eating-a-balanced-diet/",
    isPublished: true,
    order: 16,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "Why 5 A Day?",
    summary: "NHS explanation of fruit and vegetable targets and health benefits.",
    duration: "5 min read",
    body: "Explains the evidence behind the 5 A Day recommendation and practical ways to achieve it consistently.",
    sourceName: "NHS",
    sourceUrl: "https://www.nhs.uk/live-well/eat-well/5-a-day/why-5-a-day/",
    isPublished: true,
    order: 17,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "Salt Reduction",
    summary: "WHO recommendations to reduce sodium intake at population level.",
    duration: "5 min read",
    body: "Summarizes sodium-related health risks and outlines actions individuals and systems can take to reduce salt consumption.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/salt-reduction",
    isPublished: true,
    order: 18,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "Obesity and Overweight",
    summary: "WHO fact sheet on obesity risk factors and prevention priorities.",
    duration: "6 min read",
    body: "Provides global context, key risk factors, and prevention approaches related to overweight and obesity.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl:
      "https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight",
    isPublished: true,
    order: 19,
  },
  {
    topic: "nutrition",
    type: "article",
    title: "Healthy Eating for a Healthy Weight",
    summary: "CDC guidance linking eating habits with weight management goals.",
    duration: "5 min read",
    body: "Covers practical eating pattern adjustments that support healthy body weight and chronic disease risk reduction.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/healthy-weight-growth/healthy-eating/",
    isPublished: true,
    order: 20,
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
