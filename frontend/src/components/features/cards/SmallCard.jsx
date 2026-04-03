import React from "react";
import { FaStar } from "react-icons/fa";

const avatarFallback = (name) => {
  const q = encodeURIComponent(name || "Therapist");
  return `https://ui-avatars.com/api/?name=${q}&size=160&background=0ea5e9&color=fff`;
};

const formatSpecialties = (s) =>
  Array.isArray(s) ? s.join(", ") : s || "";

const TherapistCard = ({ therapist, onViewDetails }) => {
  const avg = Number(therapist?.averageRating) || 0;
  const nReviews = Number(therapist?.reviewCount) || 0;
  const stars = Math.min(5, Math.round(avg));
  const spec = formatSpecialties(therapist?.specialties);

  return (
    <div
      className={`bg-white rounded-lg p-6 hover:shadow-md transition-shadow duration-300 ${
        onViewDetails ? "cursor-pointer" : ""
      }`}
      onClick={onViewDetails}
      role={onViewDetails ? "button" : undefined}
      onKeyDown={
        onViewDetails
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onViewDetails();
              }
            }
          : undefined
      }
      tabIndex={onViewDetails ? 0 : undefined}
    >
      <div className="flex items-center mb-3">
        <img
          src={
            therapist?.profilePicture || avatarFallback(therapist?.fullName)
          }
          alt={therapist?.fullName}
          className="w-20 h-20 rounded-full object-cover mr-4 border-2 border-indigo-200 shrink-0"
          onError={(e) => {
            e.target.src = avatarFallback(therapist?.fullName);
          }}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-1 leading-tight">
            {therapist?.fullName}
          </h3>
          <p className="text-sm text-indigo-600 font-medium mb-2">{spec}</p>
          <div className="flex flex-wrap items-center gap-0.5 text-amber-500">
            {[1, 2, 3, 4, 5].map((i) => (
              <FaStar
                key={i}
                className={`w-4 h-4 ${i <= stars ? "opacity-100" : "opacity-20"}`}
              />
            ))}
            <span className="text-xs text-gray-600 font-medium ml-1">
              {avg.toFixed(1)}
              {nReviews > 0 ? ` · ${nReviews} review${nReviews === 1 ? "" : "s"}` : ""}
            </span>
          </div>
        </div>
      </div>
      {onViewDetails && (
        <p className="text-xs text-sky-600 font-medium">
          Tap to view introduction & all reviews
        </p>
      )}
    </div>
  );
};

export default TherapistCard;
