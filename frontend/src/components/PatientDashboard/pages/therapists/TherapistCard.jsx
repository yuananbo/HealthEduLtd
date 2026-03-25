import React from "react";
import Button from "../../../common/Button";

const TherapistCard = ({
  therapist,
  onViewProfile: _onViewProfile,
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

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${className}`}
    >
      <div className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <img
            className={`${imageSizes[imageSize]} rounded-full border-4 border-green-100 object-cover`}
            src={therapist.profilePicture}
            alt={therapist.fullName}
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {therapist.fullName}
        </h2>
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
          <div className="flex justify-center space-x-4">
            {/* <Button
              label={viewProfileLabel}
              variant="outlined"
              onClick={onViewProfile}
            /> */}
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
