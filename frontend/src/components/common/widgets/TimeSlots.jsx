import React, { useState } from "react";

/** Open if not explicitly booked out (isActive === false). Treat missing isActive as open; support legacy string slots. */
const isSlotBookable = (t) => {
  if (typeof t === "string") return String(t).trim() !== "";
  if (t == null) return false;
  if (t.isActive === false) return false;
  return String(t.time ?? "").trim() !== "";
};

const slotLabel = (t) =>
  typeof t === "string" ? t : String(t?.time ?? "").trim();

const normalizeSlotForParent = (t) =>
  typeof t === "string"
    ? { time: t, isActive: true }
    : { ...t, time: t?.time, isActive: t?.isActive !== false };

const AvailableTimeSlots = ({
  selectedDate,
  availabilities,
  onTimeSlotSelect,
}) => {
  const [selectedKey, setSelectedKey] = useState(null);

  // Merge all rows for this calendar day (backend also merges; this is a safety net).
  const slotsRaw = (availabilities || [])
    .filter((a) => a.date === selectedDate)
    .flatMap((a) => a.times || []);

  const timeSlots = slotsRaw.filter(isSlotBookable);

  const handleTimeSlotClick = (time) => {
    const key = slotLabel(time);
    setSelectedKey(key);
    onTimeSlotSelect(normalizeSlotForParent(time));
  };

  return (
    <div className="mt-8 bg-white rounded-xl p-6">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">
        Available Time Slots
      </h3>
      {timeSlots.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {timeSlots.map((time, index) => (
            <button
              key={`${slotLabel(time)}-${index}`}
              type="button"
              onClick={() => handleTimeSlotClick(time)}
              className={`
                py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ease-in-out
                transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                  selectedKey === slotLabel(time)
                    ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700 focus:ring-indigo-500"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-500"
                }
              `}
            >
              {slotLabel(time)}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
          <p className="text-gray-500 italic text-lg">
            No available time slots for this date.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableTimeSlots;
