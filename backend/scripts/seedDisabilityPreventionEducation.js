import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import EducationContent from "../models/educationContent.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const disabilityPreventionSeedData = [
  {
    topic: "disability-prevention",
    type: "article",
    title: "Disability and Health",
    summary: "WHO overview of disability, health inequities, and prevention priorities.",
    duration: "6 min read",
    body: "Covers major contributors to disability and practical public health actions that reduce preventable disability risk.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl:
      "https://www.who.int/news-room/fact-sheets/detail/disability-and-health",
    isPublished: true,
    order: 1,
  },
  {
    topic: "disability-prevention",
    type: "article",
    title: "Falls",
    summary: "WHO fact sheet on falls risk factors and prevention actions.",
    duration: "5 min read",
    body: "Outlines high-risk groups, home and community prevention measures, and the importance of balance and strength interventions.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/falls",
    isPublished: true,
    order: 2,
  },
  {
    topic: "disability-prevention",
    type: "article",
    title: "Road Traffic Injuries",
    summary: "WHO guidance on preventing severe injury and disability from crashes.",
    duration: "6 min read",
    body: "Explains evidence-based measures such as speed management, seat-belt use, helmet use, and safer road systems.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl:
      "https://www.who.int/news-room/fact-sheets/detail/road-traffic-injuries",
    isPublished: true,
    order: 3,
  },
  {
    topic: "disability-prevention",
    type: "article",
    title: "Injury Center",
    summary: "CDC injury prevention hub with cross-cutting resources.",
    duration: "4 min read",
    body: "Entry point for prevention resources on falls, traumatic brain injury, drowning, and violence-related injury.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/injury/index.html",
    isPublished: true,
    order: 4,
  },
  {
    topic: "disability-prevention",
    type: "article",
    title: "Older Adult Falls",
    summary: "CDC resources for reducing fall risk in older adults.",
    duration: "5 min read",
    body: "Includes risk factors, screening recommendations, and prevention actions for safer mobility and independence.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/falls/index.html",
    isPublished: true,
    order: 5,
  },
  {
    topic: "disability-prevention",
    type: "article",
    title: "STEADI: Stopping Elderly Accidents, Deaths, and Injuries",
    summary: "CDC clinical approach for fall risk assessment and prevention.",
    duration: "5 min read",
    body: "Provides a structured workflow for identifying fall risk and matching interventions to patient risk profile.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/steadi/index.html",
    isPublished: true,
    order: 6,
  },
  {
    topic: "disability-prevention",
    type: "article",
    title: "Traumatic Brain Injury",
    summary: "CDC education on TBI causes, prevention, and warning signs.",
    duration: "5 min read",
    body: "Highlights prevention strategies for common causes of TBI and guidance on seeking timely medical care.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/traumatic-brain-injury/index.html",
    isPublished: true,
    order: 7,
  },
  {
    topic: "disability-prevention",
    type: "article",
    title: "Fall Prevention",
    summary: "MedlinePlus page for practical home and lifestyle fall prevention.",
    duration: "4 min read",
    body: "Includes practical prevention tips and trusted links for reducing fall-related injuries and disability.",
    sourceName: "MedlinePlus",
    sourceUrl: "https://medlineplus.gov/fallprevention.html",
    isPublished: true,
    order: 8,
  },
  {
    topic: "disability-prevention",
    type: "article",
    title: "Home Safety",
    summary: "MedlinePlus guidance on reducing home hazards.",
    duration: "4 min read",
    body: "Covers room-by-room safety checks that reduce preventable injuries and preserve independence.",
    sourceName: "MedlinePlus",
    sourceUrl: "https://medlineplus.gov/homesafety.html",
    isPublished: true,
    order: 9,
  },
  {
    topic: "disability-prevention",
    type: "article",
    title: "Falls",
    summary: "NHS guidance on fall causes, prevention, and when to seek help.",
    duration: "5 min read",
    body: "Focuses on risk factors, medication review, and exercises that improve balance and lower fall risk.",
    sourceName: "NHS",
    sourceUrl: "https://www.nhs.uk/conditions/falls/",
    isPublished: true,
    order: 10,
  },
  {
    topic: "disability-prevention",
    type: "video",
    title: "NHS Fitness Studio",
    summary: "NHS guided workouts including low-impact and balance-friendly options.",
    duration: "Video library",
    body: "Video sessions that can be used to build safe movement habits supporting fall and disability prevention.",
    sourceName: "NHS",
    sourceUrl: "https://www.nhs.uk/live-well/exercise/nhs-fitness-studio/",
    isPublished: true,
    order: 11,
  },
  {
    topic: "disability-prevention",
    type: "video",
    title: "Balance Exercises",
    summary: "NHS guided balance routines for stability training.",
    duration: "Video guided",
    body: "A practical set of routines aimed at improving stability and reducing fall-related injury risk.",
    sourceName: "NHS",
    sourceUrl: "https://www.nhs.uk/live-well/exercise/balance-exercises/",
    isPublished: true,
    order: 12,
  },
  {
    topic: "disability-prevention",
    type: "video",
    title: "Sitting Exercises",
    summary: "NHS seated movement routines for reduced mobility users.",
    duration: "Video guided",
    body: "Supports safe physical activity for people with mobility limitations and contributes to conditioning and function.",
    sourceName: "NHS",
    sourceUrl: "https://www.nhs.uk/live-well/exercise/sitting-exercises/",
    isPublished: true,
    order: 13,
  },
  {
    topic: "disability-prevention",
    type: "video",
    title: "NIA Workout to Go",
    summary: "NIH/NIA guided workouts supporting strength and balance.",
    duration: "Video library",
    body: "Short guided sessions tailored for older adults to improve mobility and reduce risk of preventable decline.",
    sourceName: "National Institute on Aging (NIA)",
    sourceUrl:
      "https://www.nia.nih.gov/health/exercise-physical-activity/workout-go",
    isPublished: true,
    order: 14,
  },
  {
    topic: "disability-prevention",
    type: "video",
    title: "Exercise and Physical Activity",
    summary: "NIA exercise resource hub with movement education videos.",
    duration: "Video library",
    body: "Provides guided resources across strength, endurance, flexibility, and balance to preserve functional independence.",
    sourceName: "National Institute on Aging (NIA)",
    sourceUrl:
      "https://www.nia.nih.gov/health/exercise-and-physical-activity",
    isPublished: true,
    order: 15,
  },
];

const seedDisabilityPreventionEducation = async () => {
  try {
    await mongoose.connect(process.env.DBCONNECTION);

    await EducationContent.deleteMany({ topic: "disability-prevention" });
    await EducationContent.insertMany(disabilityPreventionSeedData);

    console.log(
      `Disability prevention education content seeded: ${disabilityPreventionSeedData.length} records`
    );
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed disability prevention education content:", error);
    process.exit(1);
  }
};

seedDisabilityPreventionEducation();
