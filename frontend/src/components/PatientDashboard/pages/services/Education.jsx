import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBookMedical,
  FaRunning,
  FaAppleAlt,
  FaShieldAlt,
  FaHeartbeat,
  FaPlayCircle,
  FaChevronLeft,
  FaBookmark,
  FaShareAlt,
  FaTimes,
  FaChild,
  FaClipboardList,
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
  {
    id: "child-disability-detection",
    title: "Child Disability Detection",
    description:
      "Articles and assessment tools to help identify developmental concerns in children.",
    icon: FaChild,
    color: "bg-pink-100 text-pink-600",
  },
];

const API_DRIVEN_TOPICS = new Set([
  "nutrition",
  "ncd-management",
  "exercises",
  "disability-prevention",
  "child-disability-detection",
]);

const EDUCATION_CONTENT = {
};

const Education = () => {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [dynamicContent, setDynamicContent] = useState([]);
  const [dynamicLoading, setDynamicLoading] = useState(false);
  const [dynamicError, setDynamicError] = useState("");
  const [savedContents, setSavedContents] = useState([]);
  const [, setSavedContentsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [therapists, setTherapists] = useState([]);
  const [therapistsLoading, setTherapistsLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showSavedMaterials, setShowSavedMaterials] = useState(false);
  const [savedMaterialsContent, setSavedMaterialsContent] = useState([]);
  const [savedMaterialsLoading, setSavedMaterialsLoading] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState({});
  const [questionnaireResult, setQuestionnaireResult] = useState(null);
  const [submittingQuestionnaire, setSubmittingQuestionnaire] = useState(false);

  const selectedTopicData = TOPICS.find((topic) => topic.id === selectedTopic);

  useEffect(() => {
    const fetchDynamicContent = async () => {
      try {
        setDynamicLoading(true);
        setDynamicError("");
        const response = await api.get("/patient/education/content", {
          params: { topic: selectedTopic },
        });
        setDynamicContent(response?.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch education content:", error);
        setDynamicError(`Could not load ${selectedTopicData?.title || "topic"} content right now.`);
      } finally {
        setDynamicLoading(false);
      }
    };

    if (selectedTopic && API_DRIVEN_TOPICS.has(selectedTopic)) {
      fetchDynamicContent();
    }
  }, [selectedTopic, selectedTopicData?.title]);

  useEffect(() => {
    const fetchSavedContents = async () => {
      try {
        setSavedContentsLoading(true);
        const response = await api.get("/patient/education/saved");
        if (response.data?.status === "success") {
          const savedIds = response.data.data.map((content) => content._id);
          setSavedContents(savedIds);
        }
      } catch (error) {
        console.error("Failed to fetch saved contents:", error);
      } finally {
        setSavedContentsLoading(false);
      }
    };

    fetchSavedContents();
  }, []);

  const topicContent = useMemo(() => {
    if (!selectedTopic) return [];
    if (API_DRIVEN_TOPICS.has(selectedTopic)) return dynamicContent;
    return EDUCATION_CONTENT[selectedTopic] || [];
  }, [selectedTopic, dynamicContent]);

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

  const handleSave = async (content) => {
    const contentId = content._id || content.id;
    
    try {
      const response = await api.post("/patient/education/save", {
        contentId,
      });
      
      if (response.data?.status === "success") {
        setSavedContents(response.data.savedContents || []);
      }
    } catch (error) {
      console.error("Failed to save content:", error);
      alert("Failed to save content. Please try again.");
    }
  };

  const handleShare = async (_content) => {
    // Fetch therapists list
    setTherapistsLoading(true);
    try {
      const response = await api.get("/patient/therapists");
      if (response.data?.status === "success" && response.data?.data) {
        const therapistsList = response.data.data.map((therapist) => ({
          id: therapist._id,
          fullName: `${therapist.firstName} ${therapist.lastName}`,
          specialization: therapist.specialization,
          profilePicture: therapist.profilePicture,
        }));
        setTherapists(therapistsList);
        setShowShareModal(true);
      } else {
        alert("Unable to load therapists. Please try again later.");
      }
    } catch (error) {
      console.error("Failed to fetch therapists:", error);
      alert("Unable to load therapists. Please try again later.");
    } finally {
      setTherapistsLoading(false);
    }
  };

  const handleShareToTherapist = async (_therapist, _content) => {
    try {
      setShareSuccess(true);
      setTimeout(() => {
        setShareSuccess(false);
        setShowShareModal(false);
      }, 2000);
      
    } catch (error) {
      console.error("Failed to share content:", error);
      alert("Failed to share content. Please try again.");
    }
  };

  const isContentSaved = (content) => {
    const contentId = content._id || content.id;
    return savedContents.includes(contentId);
  };

  const fetchSavedMaterials = async () => {
    setSavedMaterialsLoading(true);
    try {
      const response = await api.get("/patient/education/saved");
      if (response.data?.status === "success") {
        setSavedMaterialsContent(response.data.data || []);
      } else {
        setSavedMaterialsContent([]);
      }
    } catch (error) {
      console.error("Failed to fetch saved materials:", error);
      setSavedMaterialsContent([]);
    } finally {
      setSavedMaterialsLoading(false);
    }
  };

  useEffect(() => {
    if (showSavedMaterials) {
      fetchSavedMaterials();
    }
  }, [showSavedMaterials, savedContents]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto py-8 px-4"
    >
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
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
          <button
            type="button"
            onClick={() => {
              setShowSavedMaterials(true);
              setSelectedTopic(null);
              setSelectedContentId(null);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
          >
            <FaBookmark />
            Saved Materials {savedContents.length > 0 && `(${savedContents.length})`}
          </button>
        </div>

        {showSavedMaterials && (
          <div>
            <button
              type="button"
              onClick={() => {
                setShowSavedMaterials(false);
                setSelectedContentId(null);
              }}
              className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 mb-4"
            >
              <FaChevronLeft />
              Back to Topics
            </button>

            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Saved Materials
            </h2>

            {savedMaterialsLoading ? (
              <p className="text-sm text-gray-600">Loading saved materials...</p>
            ) : savedMaterialsContent.length === 0 ? (
              <div className="text-center py-12">
                <FaBookmark className="mx-auto text-4xl text-gray-300 mb-4" />
                <p className="text-gray-600">No saved materials yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Save content while reading to view it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedMaterialsContent.map((content) => {
                  const topicData = TOPICS.find((t) => t.id === content.topic);
                  return (
                    <button
                      key={content._id || content.id}
                      type="button"
                      onClick={() => {
                        setSelectedTopic(content.topic);
                        setSelectedContentId(content._id || content.id);
                        setShowSavedMaterials(false);
                      }}
                      className="text-left rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 uppercase">
                          {content.type}
                        </span>
                        <span className="text-xs text-gray-500">{content.duration}</span>
                      </div>
                      {topicData && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${topicData.color}`}>
                            {topicData.icon && <topicData.icon />}
                          </div>
                          <span className="text-xs text-gray-500">{topicData.title}</span>
                        </div>
                      )}
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {content.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{content.summary}</p>
                      <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                        {content.type === "video" ? (
                          <>
                            <FaPlayCircle />
                            Watch
                          </>
                        ) : (
                          <>
                            <FaBookMedical />
                            Read
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!selectedTopic && !showSavedMaterials && (
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

            {selectedTopic === "child-disability-detection" && (
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setShowQuestionnaire(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-pink-600 text-white hover:bg-pink-700 transition-colors"
                >
                  <FaClipboardList />
                  Take Assessment Questionnaire
                </button>
              </div>
            )}

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

            {API_DRIVEN_TOPICS.has(selectedTopic) && dynamicLoading && (
              <p className="text-sm text-gray-600">Loading content...</p>
            )}

            {API_DRIVEN_TOPICS.has(selectedTopic) && dynamicError && (
              <p className="text-sm text-red-600">{dynamicError}</p>
            )}

            {!dynamicLoading && !dynamicError && (
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
                    <p className="text-sm text-gray-600 mb-3">{content.summary}</p>
                    <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                      {content.type === "video" ? (
                        <>
                          <FaPlayCircle />
                          Watch
                        </>
                      ) : (
                        <>
                          <FaBookMedical />
                          Read
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!dynamicLoading &&
              !dynamicError &&
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
                  className="inline-block text-sm font-medium text-purple-600 hover:text-purple-700 mb-4"
                >
                  View Source ({selectedContent.sourceName || "Reference"})
                </a>
              )}

              {/* Save and Share Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => handleSave(selectedContent)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isContentSaved(selectedContent)
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaBookmark />
                  {isContentSaved(selectedContent) ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => handleShare(selectedContent)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <FaShareAlt />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && selectedContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Share with Therapist
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowShareModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  {shareSuccess ? (
                    <div className="text-center py-8">
                      <p className="text-lg font-medium text-gray-800">
                        Content shared successfully!
                      </p>
                    </div>
                  ) : (
                    <>
                      {therapistsLoading ? (
                        <div className="text-center py-8">
                          <p className="text-gray-600">Loading therapists...</p>
                        </div>
                      ) : therapists.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-600">
                            No therapists available at the moment.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {therapists.map((therapist) => (
                            <button
                              key={therapist.id}
                              type="button"
                              onClick={() =>
                                handleShareToTherapist(therapist, selectedContent)
                              }
                              className="w-full p-3 rounded-lg border border-gray-200 hover:bg-purple-50 hover:border-purple-300 transition-colors text-left"
                            >
                              <p className="font-medium text-gray-800">
                                {therapist.fullName}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questionnaire Modal for Child Disability Detection */}
        <AnimatePresence>
          {showQuestionnaire && selectedTopic === "child-disability-detection" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowQuestionnaire(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800">
                      Child Disability Detection Assessment
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowQuestionnaire(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        1. Does your child respond to their name when called?
                      </label>
                      <div className="space-y-2">
                        {["Always", "Often", "Sometimes", "Rarely/Never"].map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="radio"
                              name="q1"
                              value={option}
                              checked={questionnaireAnswers.q1 === option}
                              onChange={(e) =>
                                setQuestionnaireAnswers({
                                  ...questionnaireAnswers,
                                  q1: e.target.value,
                                })
                              }
                              className="mr-2"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        2. How does your child interact with other children?
                      </label>
                      <div className="space-y-2">
                        {[
                          "Very well, enjoys playing with others",
                          "Moderately, sometimes plays alone",
                          "Prefers to play alone",
                          "Avoids interaction",
                        ].map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="radio"
                              name="q2"
                              value={option}
                              checked={questionnaireAnswers.q2 === option}
                              onChange={(e) =>
                                setQuestionnaireAnswers({
                                  ...questionnaireAnswers,
                                  q2: e.target.value,
                                })
                              }
                              className="mr-2"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        3. Does your child make eye contact during conversations?
                      </label>
                      <div className="space-y-2">
                        {["Always", "Often", "Sometimes", "Rarely/Never"].map(
                          (option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="radio"
                                name="q3"
                                value={option}
                                checked={questionnaireAnswers.q3 === option}
                                onChange={(e) =>
                                  setQuestionnaireAnswers({
                                    ...questionnaireAnswers,
                                    q3: e.target.value,
                                  })
                                }
                                className="mr-2"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        4. How does your child handle changes in routine?
                      </label>
                      <div className="space-y-2">
                        {[
                          "Adapts easily",
                          "Some difficulty but manages",
                          "Significant distress",
                          "Extreme difficulty",
                        ].map((option) => (
                          <label key={option} className="flex items-center">
                            <input
                              type="radio"
                              name="q4"
                              value={option}
                              checked={questionnaireAnswers.q4 === option}
                              onChange={(e) =>
                                setQuestionnaireAnswers({
                                  ...questionnaireAnswers,
                                  q4: e.target.value,
                                })
                              }
                              className="mr-2"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        5. Does your child show interest in age-appropriate activities?
                      </label>
                      <div className="space-y-2">
                        {["Yes, very interested", "Moderately interested", "Limited interest", "No interest"].map(
                          (option) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="radio"
                                name="q5"
                                value={option}
                                checked={questionnaireAnswers.q5 === option}
                                onChange={(e) =>
                                  setQuestionnaireAnswers({
                                    ...questionnaireAnswers,
                                    q5: e.target.value,
                                  })
                                }
                                className="mr-2"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          )
                        )}
                      </div>
                    </div>

                    {questionnaireResult ? (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="bg-gray-50 rounded-lg p-6 mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">
                            Assessment Results
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-medium">Total Score:</span>
                              <span className="text-2xl font-bold text-gray-800">
                                {questionnaireResult.score}/15
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700 font-medium">Risk Level:</span>
                              <span
                                className={`px-4 py-2 rounded-full font-semibold ${
                                  questionnaireResult.riskLevel === "Low Risk"
                                    ? "bg-green-100 text-green-700"
                                    : questionnaireResult.riskLevel === "Moderate Risk"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {questionnaireResult.riskLevel}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 p-4 bg-white rounded border border-gray-200">
                            <p className="text-sm text-gray-600">
                              {questionnaireResult.riskLevel === "Low Risk" &&
                                "Your child appears to be developing typically. Continue monitoring and regular check-ups."}
                              {questionnaireResult.riskLevel === "Moderate Risk" &&
                                "Some concerns were identified. Consider discussing these observations with your pediatrician or a developmental specialist."}
                              {questionnaireResult.riskLevel === "High Risk" &&
                                "Several concerns were identified. We recommend consulting with your pediatrician and considering a comprehensive developmental evaluation."}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setQuestionnaireResult(null);
                            setQuestionnaireAnswers({});
                            setShowQuestionnaire(false);
                          }}
                          className="w-full px-4 py-2 rounded-lg font-medium bg-pink-600 text-white hover:bg-pink-700 transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setQuestionnaireAnswers({});
                            setShowQuestionnaire(false);
                          }}
                          className="flex-1 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={submittingQuestionnaire || Object.keys(questionnaireAnswers).length < 5}
                          onClick={async () => {
                            if (Object.keys(questionnaireAnswers).length < 5) {
                              alert("Please answer all questions before submitting.");
                              return;
                            }

                            setSubmittingQuestionnaire(true);
                            try {
                              const response = await api.post("/patient/education/questionnaire", {
                                topic: "child-disability-detection",
                                answers: questionnaireAnswers,
                              });

                              if (response.data?.status === "success") {
                                setQuestionnaireResult(response.data.data);
                              } else {
                                alert("Failed to submit questionnaire. Please try again.");
                              }
                            } catch (error) {
                              console.error("Failed to submit questionnaire:", error);
                              alert("Failed to submit questionnaire. Please try again.");
                            } finally {
                              setSubmittingQuestionnaire(false);
                            }
                          }}
                          className="flex-1 px-4 py-2 rounded-lg font-medium bg-pink-600 text-white hover:bg-pink-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {submittingQuestionnaire ? "Submitting..." : "Submit Assessment"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Education;
