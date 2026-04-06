import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaTimes } from "react-icons/fa";
import api from "../../../../utils/api";
import toast from "react-hot-toast";

function StarSummary({ value, reviewCount }) {
  const v = Number(value) || 0;
  const rounded = Math.min(5, Math.round(v));
  return (
    <div className="flex flex-wrap items-center gap-1 text-amber-500">
      {[1, 2, 3, 4, 5].map((i) => (
        <FaStar
          key={i}
          className={`text-lg ${i <= rounded ? "opacity-100" : "opacity-20"}`}
        />
      ))}
      <span className="text-sm text-gray-700 font-medium ml-1">
        {v.toFixed(1)}
        {reviewCount != null ? ` · ${reviewCount} review${reviewCount === 1 ? "" : "s"}` : ""}
      </span>
    </div>
  );
}

const avatarFallback = (name) => {
  const q = encodeURIComponent(name || "Therapist");
  return `https://ui-avatars.com/api/?name=${q}&size=160&background=0ea5e9&color=fff`;
};

/**
 * Patient-facing modal: bio, average rating, and individual reviews (from GET /rating/:id).
 */
const TherapistProfileModal = ({ isOpen, onClose, therapistId, summary }) => {
  const [loading, setLoading] = useState(false);
  const [therapist, setTherapist] = useState(null);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (!isOpen || !therapistId) {
      setTherapist(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/rating/${therapistId}`);
        if (!cancelled) {
          setTherapist(data.therapist);
          setAverageRating(Number(data.averageRating) || 0);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(
            e?.response?.data?.message || "Could not load therapist details"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, therapistId]);

  const display = therapist || summary;
  const reviews = Array.isArray(therapist?.ratings) ? therapist.ratings : [];
  const fullName =
    display?.fullName ||
    (display?.firstName != null && display?.lastName != null
      ? `${display.firstName} ${display.lastName}`
      : "");
  const title =
    display?.specialization ||
    (Array.isArray(display?.specialties)
      ? display.specialties.join(", ")
      : display?.specialties || "");
  const bio = display?.bio || therapist?.bio || "";
  const img =
    display?.profilePicture ||
    therapist?.profilePicture ||
    avatarFallback(fullName);
  const avg =
    therapist != null
      ? averageRating
      : Number(summary?.averageRating) || 0;
  const count =
    therapist != null
      ? reviews.length
      : Number(summary?.reviewCount) || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 p-4 border-b border-gray-100">
              <div className="flex gap-3 min-w-0">
                <img
                  src={img}
                  alt={fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-sky-200 shrink-0"
                  onError={(e) => {
                    e.target.src = avatarFallback(fullName);
                  }}
                />
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">
                    {fullName || "Therapist"}
                  </h2>
                  <p className="text-sm text-sky-600 font-medium mt-0.5">
                    {title}
                  </p>
                  <div className="mt-2">
                    <StarSummary value={avg} reviewCount={count} />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 shrink-0"
                aria-label="Close"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-4 space-y-4 flex-1">
              {loading && !therapist && (
                <p className="text-gray-500 text-sm">Loading details…</p>
              )}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Introduction
                </h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">
                  {bio || "No biography provided yet."}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Reviews
                </h3>
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reviews yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {reviews.map((r) => {
                      const patient = r.patient;
                      const who =
                        r.isAnonymous || !patient
                          ? "Anonymous patient"
                          : `${patient.firstName || ""} ${patient.lastName || ""}`.trim() ||
                            "Patient";
                      return (
                        <li
                          key={r._id}
                          className="border border-gray-100 rounded-lg p-3 bg-gray-50"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-800">
                              {who}
                            </span>
                            <span className="text-amber-500 text-sm font-semibold">
                              {r.rating != null ? `${r.rating}/5` : "—"}
                            </span>
                          </div>
                          {r.review ? (
                            <p className="text-sm text-gray-600">{r.review}</p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              No written review
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TherapistProfileModal;
