import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import EducationContent from "../models/educationContent.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const exercisesSeedData = [
  {
    topic: "exercises",
    type: "article",
    title: "Physical Activity Basics",
    summary: "CDC introduction to core concepts and activity planning.",
    duration: "5 min read",
    body: "Provides foundational guidance for building an activity routine and understanding moderate versus vigorous intensity.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/physical-activity-basics/index.html",
    isPublished: true,
    order: 1,
  },
  {
    topic: "exercises",
    type: "article",
    title: "How Much Physical Activity Do Adults Need?",
    summary: "CDC recommendations for aerobic and muscle-strengthening activity.",
    duration: "4 min read",
    body: "Details weekly targets for adults and offers practical examples to meet activity thresholds safely.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl:
      "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html",
    isPublished: true,
    order: 2,
  },
  {
    topic: "exercises",
    type: "video",
    title: "NHS Fitness Studio",
    summary: "NHS follow-along video workouts for different activity levels.",
    duration: "Video library",
    body: "A curated set of instructor-led workout videos, including low-impact and condition-appropriate options.",
    sourceName: "NHS",
    sourceUrl: "https://www.nhs.uk/live-well/exercise/nhs-fitness-studio/",
    isPublished: true,
    order: 3,
  },
  {
    topic: "exercises",
    type: "video",
    title: "NIA Workout to Go",
    summary: "NIH/NIA guided exercise videos tailored for older adults.",
    duration: "Video library",
    body: "Short guided workouts focused on endurance, strength, balance, and flexibility.",
    sourceName: "National Institute on Aging (NIA)",
    sourceUrl:
      "https://www.nia.nih.gov/health/exercise-physical-activity/workout-go",
    isPublished: true,
    order: 4,
  },
  {
    topic: "exercises",
    type: "video",
    title: "Strength Exercises",
    summary: "NHS bodyweight and resistance movement video guidance.",
    duration: "Video guided",
    body: "Foundational strengthening drills and progression tips for safe form.",
    sourceName: "NHS",
    sourceUrl: "https://www.nhs.uk/live-well/exercise/strength-exercises/",
    isPublished: true,
    order: 5,
  },
  {
    topic: "exercises",
    type: "video",
    title: "Flexibility Exercises",
    summary: "NHS guided routines to support mobility and range of motion.",
    duration: "Video guided",
    body: "Low-impact movement options that support posture and stiffness reduction.",
    sourceName: "NHS",
    sourceUrl: "https://www.nhs.uk/live-well/exercise/flexibility-exercises/",
    isPublished: true,
    order: 6,
  },
  {
    topic: "exercises",
    type: "video",
    title: "Balance Exercises",
    summary: "NHS guided balance exercises to reduce fall risk.",
    duration: "Video guided",
    body: "Simple drills designed for regular home practice and balance improvement.",
    sourceName: "NHS",
    sourceUrl: "https://www.nhs.uk/live-well/exercise/balance-exercises/",
    isPublished: true,
    order: 7,
  },
  {
    topic: "exercises",
    type: "video",
    title: "Sitting Exercises",
    summary: "NHS seated exercise routines for lower mobility.",
    duration: "Video guided",
    body: "Chair-based routines suitable for rehabilitation and low-mobility contexts.",
    sourceName: "NHS",
    sourceUrl: "https://www.nhs.uk/live-well/exercise/sitting-exercises/",
    isPublished: true,
    order: 8,
  },
  {
    topic: "exercises",
    type: "video",
    title: "Exercise and Physical Activity",
    summary: "NIA video-focused exercise hub for healthy aging.",
    duration: "Video library",
    body: "Practical exercise resources across strength, endurance, flexibility, and balance.",
    sourceName: "National Institute on Aging (NIA)",
    sourceUrl:
      "https://www.nia.nih.gov/health/exercise-and-physical-activity",
    isPublished: true,
    order: 9,
  },
  {
    topic: "exercises",
    type: "video",
    title: "Physical Activity for Adults with Chronic Conditions and Disabilities",
    summary: "CDC practical video-style guidance for adaptive exercise plans.",
    duration: "Video guided",
    body: "Principles for safe activity progression in adults managing chronic conditions or disabilities.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl:
      "https://www.cdc.gov/physical-activity-basics/guidelines/adults-with-chronic-conditions.html",
    isPublished: true,
    order: 10,
  },
  {
    topic: "exercises",
    type: "video",
    title: "Physical Activity Guidelines for Adults (19 to 64)",
    summary: "NHS movement targets with practical guided activity planning.",
    duration: "Video guided",
    body: "Minimum aerobic and strengthening recommendations with examples of weekly distribution.",
    sourceName: "NHS",
    sourceUrl:
      "https://www.nhs.uk/live-well/exercise/exercise-guidelines/physical-activity-guidelines-adults-aged-19-to-64/",
    isPublished: true,
    order: 11,
  },
  {
    topic: "exercises",
    type: "video",
    title: "How Much Activity Do Older Adults Need?",
    summary: "CDC older-adult activity guidance for strength and balance.",
    duration: "Video guided",
    body: "Age-appropriate weekly goals with emphasis on mobility and fall prevention.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl:
      "https://www.cdc.gov/physical-activity-basics/guidelines/older-adults.html",
    isPublished: true,
    order: 12,
  },
];

const seedExercisesEducation = async () => {
  try {
    await mongoose.connect(process.env.DBCONNECTION);

    // Full refresh for this topic so removed items are truly deleted.
    await EducationContent.deleteMany({ topic: "exercises" });
    await EducationContent.insertMany(exercisesSeedData);

    console.log(
      `Exercises education content seeded: ${exercisesSeedData.length} records`
    );
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed exercises education content:", error);
    process.exit(1);
  }
};

seedExercisesEducation();
