import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaBookMedical,
  FaRunning,
  FaAppleAlt,
  FaShieldAlt,
  FaHeartbeat,
  FaPlayCircle,
  FaChevronLeft,
} from "react-icons/fa";
import api from "../../../../utils/api";

const TOPICS = [
  {
    id: "ncd-management",
    title: "NCD Management",
    description:
      "Practical guidance for managing long-term conditions like diabetes and hypertension.",
    icon: FaHeartbeat,
    color: "bg-red-100 text-red-600",
  },
  {
    id: "exercises",
    title: "Exercises",
    description:
      "Safe routines to improve mobility, strength, and day-to-day independence.",
    icon: FaRunning,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: "nutrition",
    title: "Nutrition",
    description:
      "Food planning and hydration tips that support recovery and wellness goals.",
    icon: FaAppleAlt,
    color: "bg-green-100 text-green-600",
  },
  {
    id: "disability-prevention",
    title: "Disability Prevention",
    description:
      "Early warning signs, prevention habits, and home safety recommendations.",
    icon: FaShieldAlt,
    color: "bg-amber-100 text-amber-600",
  },
];

const EDUCATION_CONTENT = {
  "ncd-management": [
    {
      id: "ncd-1",
      type: "article",
      title: "Daily Blood Pressure Self-Check",
      summary: "How to measure blood pressure correctly and track trends.",
      duration: "6 min read",
      body: "Measure at the same time each day, sit for 5 minutes before checking, and log results. Contact your care team if repeated readings stay above your target range.",
    },
    {
      id: "ncd-2",
      type: "video",
      title: "Medication Adherence Basics",
      summary: "Simple strategies to avoid missed doses.",
      duration: "4 min watch",
      body: "Use pill organizers, set reminders, and align medication schedules with existing habits like meals or bedtime routines.",
    },
  ],
  exercises: [
    {
      id: "ex-1",
      type: "video",
      title: "Gentle Home Mobility Routine",
      summary: "A beginner-friendly routine for daily movement.",
      duration: "8 min watch",
      body: "Start with neck and shoulder mobility, then progress to seated leg raises and standing balance support drills near a stable surface.",
    },
    {
      id: "ex-2",
      type: "article",
      title: "How to Progress Exercise Safely",
      summary: "Rules for increasing intensity without overexertion.",
      duration: "5 min read",
      body: "Increase only one variable at a time: repetitions, duration, or resistance. Stop if you experience sharp pain, dizziness, or unusual shortness of breath.",
    },
  ],
  "disability-prevention": [
    {
      id: "dp-1",
      type: "article",
      title: "Fall Prevention Checklist",
      summary: "Home adjustments that reduce fall risk.",
      duration: "6 min read",
      body: "Remove loose rugs, improve lighting in hallways, install grab bars in bathrooms, and wear non-slip footwear.",
    },
    {
      id: "dp-2",
      type: "video",
      title: "Warning Signs You Should Not Ignore",
      summary: "Symptoms that require early professional evaluation.",
      duration: "5 min watch",
      body: "Seek early review for persistent numbness, progressive weakness, worsening balance, or repeated near-falls.",
    },
  ],
};

const Education = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [nutritionContent, setNutritionContent] = useState([]);
  const [nutritionLoading, setNutritionLoading] = useState(false);
  const [nutritionError, setNutritionError] = useState("");

  const selectedTopicData = TOPICS.find((topic) => topic.id === selectedTopic);

  useEffect(() => {
    const fetchNutritionContent = async () => {
      try {
        setNutritionLoading(true);
        setNutritionError("");
        const response = await api.get("/patient/education/nutrition");
        setNutritionContent(response?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch nutrition education content:", error);
        setNutritionError("Could not load Nutrition content right now.");
      } finally {
        setNutritionLoading(false);
      }
    };

    if (selectedTopic === "nutrition") {
      fetchNutritionContent();
    }
  }, [selectedTopic]);

  const topicContent = useMemo(() => {
    if (!selectedTopic) return [];
    if (selectedTopic === "nutrition") return nutritionContent;
    return EDUCATION_CONTENT[selectedTopic] || [];
  }, [selectedTopic, nutritionContent]);

  const filteredContent = useMemo(() => {
    if (contentTypeFilter === "all") return topicContent;
    return topicContent.filter((content) => content.type === contentTypeFilter);
  }, [contentTypeFilter, topicContent]);

  const selectedContent = topicContent.find(
    (content) => (content._id || content.id) === selectedContentId
  );

  const goBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedContentId(null);
    setContentTypeFilter("all");
  };

  const goBackToContent = () => {
    setSelectedContentId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto py-8 px-4"
    >
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600">
            <FaBookMedical className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Education</h1>
            <p className="text-sm text-gray-500">
              Education Platform Flow: Topic {"->"} Content {"->"} Read/Watch
            </p>
          </div>
        </div>

        {!selectedTopic && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Choose Topic
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TOPICS.map((topic) => {
                const Icon = topic.icon;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setSelectedTopic(topic.id)}
                    className="text-left rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                  >
                    <div
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 ${topic.color}`}
                    >
                      <Icon />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 mb-1">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-600">{topic.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedTopic && !selectedContent && (
          <div>
            <button
              type="button"
              onClick={goBackToTopics}
              className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mb-4"
            >
              <FaChevronLeft />
              Back to Topics
            </button>

            <h2 className="text-lg font-semibold text-gray-800">
              {selectedTopicData?.title}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Choose content to read or watch.
            </p>

            <div className="flex gap-2 mb-4">
              {["all", "article", "video"].map((filterValue) => (
                <button
                  key={filterValue}
                  type="button"
                  onClick={() => setContentTypeFilter(filterValue)}
                  className={`px-3 py-1.5 rounded-full text-sm capitalize ${
                    contentTypeFilter === filterValue
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filterValue}
                </button>
              ))}
            </div>

            {selectedTopic === "nutrition" && nutritionLoading && (
              <p className="text-sm text-gray-600">Loading nutrition content...</p>
            )}

            {selectedTopic === "nutrition" && nutritionError && (
              <p className="text-sm text-red-600">{nutritionError}</p>
            )}

            {!nutritionLoading && !nutritionError && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredContent.map((content) => (
                  <button
                    key={content._id || content.id}
                    type="button"
                    onClick={() => setSelectedContentId(content._id || content.id)}
                    className="text-left rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 uppercase">
                        {content.type}
                      </span>
                      <span className="text-xs text-gray-500">{content.duration}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {content.title}
                    </h3>
                    <p className="text-sm text-gray-600">{content.summary}</p>
                  </button>
                ))}
              </div>
            )}

            {!nutritionLoading &&
              !nutritionError &&
              filteredContent.length === 0 && (
                <p className="text-sm text-gray-600">
                  No content available for this topic yet.
                </p>
              )}
          </div>
        )}

        {selectedTopic && selectedContent && (
          <div>
            <button
              type="button"
              onClick={goBackToContent}
              className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mb-4"
            >
              <FaChevronLeft />
              Back to Content
            </button>

            <div className="rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 uppercase">
                  {selectedContent.type}
                </span>
                <span className="text-xs text-gray-500">
                  {selectedContent.duration}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {selectedContent.title}
              </h2>
              <p className="text-gray-600 mb-4">{selectedContent.summary}</p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2 text-gray-700">
                  {selectedContent.type === "video" ? (
                    <FaPlayCircle />
                  ) : (
                    <FaBookMedical />
                  )}
                  <span className="font-medium">
                    {selectedContent.type === "video"
                      ? "Watch Content"
                      : "Read Content"}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{selectedContent.body}</p>
              </div>

              {selectedContent.sourceUrl && (
                <a
                  href={selectedContent.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  View Source ({selectedContent.sourceName || "Reference"})
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Education;
