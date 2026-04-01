import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import EducationContent from "../models/educationContent.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const childDisabilityDetectionData = [
  {
    topic: "child-disability-detection",
    type: "article",
    title: "Developmental Disability Basics",
    summary: "Learn about developmental disabilities, their causes, risk factors, and who is affected. Important information from CDC on early detection and intervention.",
    duration: "10 min read",
    body: `Developmental disabilities are a group of conditions due to an impairment in physical, learning, language, or behavior areas. These conditions begin during the child's developmental period, may impact day-to-day functioning, and usually last throughout a person's lifetime.

What to Know

Most developmental disabilities begin before a baby is born, but some can happen after birth because of injury, infection, or other factors. Early detection and intervention can make a significant difference in a child's development and future outcomes.

Causes and Risk Factors

Most developmental disabilities are thought to be caused by a complex mix of factors. These factors include genetics, such as genetic and chromosomal conditions like Down syndrome and fragile X syndrome. Parental health and behaviors during pregnancy, such as smoking and drinking, can increase risk. Complications during birth, including premature birth, low birthweight, and multiple births, are also contributing factors.

Infections play a role as well. Maternal infections during pregnancy, such as cytomegalovirus, or infections the baby might have very early in life can lead to developmental disabilities. Environmental factors, such as exposure to high levels of environmental toxins like lead, are also associated with increased risk.

Specific research findings show that at least 25% of hearing loss among babies is due to maternal infections during pregnancy, complications after birth, and head trauma. Some of the most common known causes of intellectual disability include fetal alcohol spectrum disorders, genetic conditions, and certain infections during pregnancy. Children who have a sibling with autism spectrum disorder are at a higher risk of also having autism spectrum disorder. Untreated newborn jaundice can cause a type of brain damage known as kernicterus, which can lead to cerebral palsy, hearing and vision problems.

Who is Affected

Developmental disabilities occur among all racial, ethnic, and socioeconomic groups. Recent estimates in the United States show that about 1 in 6, or about 17%, of children aged 3 through 17 years have one or more developmental disabilities. These include ADHD (Attention-Deficit/Hyperactivity Disorder), autism spectrum disorder, cerebral palsy, hearing loss, fragile X syndrome, Tourette syndrome, and other developmental disabilities.

Healthy Living for People with Disabilities

Children and adults with disabilities need health care and health programs for the same reasons anyone else does—to stay well, active, and a part of the community. Having a disability does not mean a person is not healthy or that they cannot be healthy. Being healthy means getting and staying well so we can lead full, active lives.

Some health conditions, such as asthma, gastrointestinal symptoms, eczema and skin allergies, and migraine headaches, have been found to be more common among children with developmental disabilities. Thus, it is especially important for children with developmental disabilities to see a health care provider regularly.

Don't Wait - Act Early

If you're concerned about your child's development, don't wait. You know your child best. Act early on developmental concerns to make a real difference for your child and you. Early intervention services can help children from birth through 3 years of age learn important skills. Services include therapy to help the child talk, walk, and interact with others. The earlier services are received, the better the outcomes.

Key Takeaways

Developmental disabilities affect about 1 in 6 children in the United States. Most begin before birth, but some can occur after birth. Early detection and intervention are crucial. Regular health care is especially important for children with developmental disabilities. If you have concerns, don't wait—consult with your healthcare provider. Early identification and intervention can significantly improve outcomes for children with developmental disabilities.`,
    sourceName: "Centers for Disease Control and Prevention (CDC)",
    sourceUrl: "https://www.cdc.gov/child-development/about/developmental-disability-basics.html",
    isPublished: true,
    order: 0,
  },
];

const seedChildDisabilityDetection = async () => {
  try {
    await mongoose.connect(process.env.DBCONNECTION);

    for (const item of childDisabilityDetectionData) {
      await EducationContent.findOneAndUpdate(
        { topic: item.topic, title: item.title },
        item,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    console.log(
      `Child disability detection education content seeded: ${childDisabilityDetectionData.length} records`
    );
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed child disability detection content:", error);
    process.exit(1);
  }
};

seedChildDisabilityDetection();
