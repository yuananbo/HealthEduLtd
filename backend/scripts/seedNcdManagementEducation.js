import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import EducationContent from "../models/educationContent.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const ncdSeedData = [
  {
    topic: "ncd-management",
    type: "article",
    title: "Noncommunicable Diseases",
    summary: "WHO overview of the four major NCD groups and key risk factors.",
    duration: "6 min read",
    body: "Defines major NCD categories and highlights prevention priorities including tobacco control, healthy diet, physical activity, and reduced harmful alcohol use.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl:
      "https://www.who.int/news-room/fact-sheets/detail/noncommunicable-diseases",
    isPublished: true,
    order: 1,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "Cardiovascular Diseases (CVDs)",
    summary: "WHO fact sheet on causes, risk factors, and prevention actions.",
    duration: "6 min read",
    body: "Explains major cardiovascular disease types and practical risk-reduction steps including blood pressure control, smoking cessation, and healthy eating.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl:
      "https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)",
    isPublished: true,
    order: 2,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "Diabetes",
    summary: "WHO diabetes fact sheet with prevention and care priorities.",
    duration: "6 min read",
    body: "Covers diabetes burden, risk factors, early detection, and management principles including medication adherence and lifestyle support.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes",
    isPublished: true,
    order: 3,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "Cancer",
    summary: "WHO fact sheet on cancer prevention and early diagnosis.",
    duration: "6 min read",
    body: "Summarizes preventable risk factors, value of screening and early diagnosis, and health-system actions for improved outcomes.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/cancer",
    isPublished: true,
    order: 4,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "Chronic Diseases in America",
    summary: "CDC overview of chronic disease burden and prevention opportunities.",
    duration: "5 min read",
    body: "Provides U.S. context on chronic disease prevalence, costs, and practical prevention measures at individual and community levels.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/chronicdisease/about/index.htm",
    isPublished: true,
    order: 5,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "About Heart Disease",
    summary: "CDC summary of heart disease risk factors and prevention steps.",
    duration: "5 min read",
    body: "Highlights major risk factors and recommends blood pressure control, healthy lifestyle habits, and regular clinical follow-up.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/heart-disease/about/index.html",
    isPublished: true,
    order: 6,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "About Diabetes",
    summary: "CDC primer on diabetes types, risk factors, and complications.",
    duration: "5 min read",
    body: "Outlines diabetes basics and prevention/management priorities including glucose monitoring and long-term risk reduction.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/diabetes/about/index.html",
    isPublished: true,
    order: 7,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "About Stroke",
    summary: "CDC guidance on stroke risk factors and warning signs.",
    duration: "4 min read",
    body: "Covers stroke types, rapid-response warning signs, and prevention strategies linked to blood pressure and cardiovascular health.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/stroke/about/index.html",
    isPublished: true,
    order: 8,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "About High Cholesterol",
    summary: "CDC information on cholesterol and cardiovascular risk.",
    duration: "4 min read",
    body: "Explains cholesterol numbers and the importance of screening, lifestyle changes, and treatment adherence.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/cholesterol/about/index.html",
    isPublished: true,
    order: 9,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "About Chronic Kidney Disease",
    summary: "CDC page on CKD risk factors, testing, and prevention.",
    duration: "5 min read",
    body: "Describes CKD risk groups and emphasizes early testing and management of blood pressure and diabetes.",
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/kidneydisease/basics.html",
    isPublished: true,
    order: 10,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "High Blood Pressure",
    summary: "NHLBI overview of hypertension and long-term health effects.",
    duration: "6 min read",
    body: "Defines high blood pressure, associated risks, and the role of monitoring, medication, and behavior change in ongoing management.",
    sourceName: "National Heart, Lung, and Blood Institute (NHLBI)",
    sourceUrl: "https://www.nhlbi.nih.gov/health/high-blood-pressure",
    isPublished: true,
    order: 11,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "What Is Diabetes?",
    summary: "NIDDK overview of diabetes causes, symptoms, and management.",
    duration: "6 min read",
    body: "Provides a structured introduction to diabetes pathophysiology and practical management pillars.",
    sourceName: "National Institute of Diabetes and Digestive and Kidney Diseases",
    sourceUrl: "https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes",
    isPublished: true,
    order: 12,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "About Diabetes Diagnosis",
    summary: "American Diabetes Association guidance on diagnostic criteria.",
    duration: "5 min read",
    body: "Explains A1C and glucose test criteria used for diabetes and prediabetes diagnosis.",
    sourceName: "American Diabetes Association",
    sourceUrl: "https://diabetes.org/about-diabetes/diagnosis",
    isPublished: true,
    order: 13,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "Living with Diabetes",
    summary: "Practical ADA resources for day-to-day diabetes self-management.",
    duration: "5 min read",
    body: "Focuses on daily routines, treatment adherence, and behavior changes that support glycemic control and complication prevention.",
    sourceName: "American Diabetes Association",
    sourceUrl: "https://diabetes.org/living-with-diabetes",
    isPublished: true,
    order: 14,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "About High Blood Pressure",
    summary: "American Heart Association education on hypertension management.",
    duration: "5 min read",
    body: "Provides practical guidance on blood pressure categories and long-term cardiovascular risk reduction strategies.",
    sourceName: "American Heart Association",
    sourceUrl:
      "https://www.heart.org/en/health-topics/high-blood-pressure",
    isPublished: true,
    order: 15,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "Understanding Blood Pressure Readings",
    summary: "AHA explanation of systolic/diastolic values and categories.",
    duration: "4 min read",
    body: "Breaks down blood pressure categories and helps patients interpret readings for follow-up action.",
    sourceName: "American Heart Association",
    sourceUrl:
      "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings",
    isPublished: true,
    order: 16,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "Physical Activity",
    summary: "WHO fact sheet linking physical activity with NCD prevention.",
    duration: "5 min read",
    body: "Explains the role of regular activity in preventing and managing chronic disease across age groups.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
    isPublished: true,
    order: 17,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "Tobacco",
    summary: "WHO fact sheet on tobacco as a major NCD risk factor.",
    duration: "5 min read",
    body: "Summarizes health harms from tobacco use and evidence-based cessation/policy approaches that reduce NCD burden.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/tobacco",
    isPublished: true,
    order: 18,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "Chronic Obstructive Pulmonary Disease (COPD)",
    summary: "WHO fact sheet on COPD risk factors and disease burden.",
    duration: "5 min read",
    body: "Provides an overview of COPD causes, prevention priorities, and treatment principles for long-term disease control.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl:
      "https://www.who.int/news-room/fact-sheets/detail/chronic-obstructive-pulmonary-disease-(copd)",
    isPublished: true,
    order: 19,
  },
  {
    topic: "ncd-management",
    type: "article",
    title: "WHO Framework Convention on Tobacco Control (WHO FCTC)",
    summary: "Global policy framework supporting tobacco control and NCD prevention.",
    duration: "4 min read",
    body: "Outlines treaty-level tobacco control measures that reduce major NCD risk exposure in populations.",
    sourceName: "World Health Organization (WHO)",
    sourceUrl:
      "https://www.who.int/teams/health-promotion/tobacco-control/who-framework-convention-on-tobacco-control",
    isPublished: true,
    order: 20,
  },
];

const seedNcdManagementEducation = async () => {
  try {
    await mongoose.connect(process.env.DBCONNECTION);

    for (const item of ncdSeedData) {
      await EducationContent.findOneAndUpdate(
        { topic: item.topic, title: item.title },
        item,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log(
      `NCD management education content seeded: ${ncdSeedData.length} records`
    );
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed NCD management education content:", error);
    process.exit(1);
  }
};

seedNcdManagementEducation();
