import React from "react";
import { FaStar } from "react-icons/fa";
import Button from "../../../common/Button";

const avatarFallback = (name) => {
  const q = encodeURIComponent(name || "Therapist");
  return `https://ui-avatars.com/api/?name=${q}&size=256&background=0ea5e9&color=fff`;
};

const TherapistCard = ({
  therapist,
  onViewProfile,
  onViewDetails,
  onBookAppointment,
  viewProfileLabel: _viewProfileLabel = "View Profile",
  bookAppointmentLabel = "Book Appointment",
  showButtons = true,
  className = "",
  imageSize = "medium",
}) => {
  const imageSizes = {
    small: "w-20 h-20",
    medium: "w-28 h-28",
    large: "w-36 h-36",
  };

  const avg = Number(therapist.averageRating) || 0;
  const nReviews = Number(therapist.reviewCount) || 0;
  const stars = Math.min(5, Math.round(avg));

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${className}`}
    >
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <img
            className={`${imageSizes[imageSize]} rounded-full border-4 border-green-100 object-cover`}
            src={therapist.profilePicture || avatarFallback(therapist.fullName)}
            alt={therapist.fullName}
            onError={(e) => {
              e.target.src = avatarFallback(therapist.fullName);
            }}
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {therapist.fullName}
        </h2>
        <div className="flex justify-center items-center gap-1 text-amber-500 mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <FaStar
              key={i}
              className={i <= stars ? "opacity-100" : "opacity-20"}
            />
          ))}
          <span className="text-sm text-gray-600 ml-1 font-medium">
            {avg.toFixed(1)}
            {nReviews > 0 ? ` (${nReviews})` : ""}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {therapist.city}, {therapist.country}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {therapist.specialties.map((specialty, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-50 text-greenPrimary text-xs rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>
        <p className="text-gray-700 mb-6 line-clamp-3">{therapist.bio}</p>
        {showButtons && (
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:space-x-4 sm:gap-0">
            {onViewDetails ? (
              <Button
                label="Profile & reviews"
                variant="outlined"
                onClick={onViewDetails}
              />
            ) : null}
            <Button
              label={bookAppointmentLabel}
              variant="filled"
              onClick={onBookAppointment}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistCard;
