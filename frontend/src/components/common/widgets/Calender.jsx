import React, { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { coerceApiDateToYmd, ymdToLocalDate } from "../../../utils/availabilityDate";

const AvailabilityDayPicker = ({ availabilities, onDateClick }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);

  const formatDate = (date) => {
    // Use local calendar date (NOT UTC) to avoid timezone off-by-one bugs.
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    // Only mark a day as available if it has at least one active slot.
    const dates = (availabilities || [])
      .filter((availability) =>
        (availability?.times || []).some((t) => Boolean(t?.isActive))
      )
      .map((availability) => {
        const ymd = coerceApiDateToYmd(availability?.date);
        return ymdToLocalDate(ymd);
      })
      .filter(Boolean);
    setAvailableDates(dates);
  }, [availabilities]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(formatDate(date));
    }
  };

  const isDateAvailable = (date) => {
    return availableDates.some(
      (availableDate) => formatDate(availableDate) === formatDate(date)
    );
  };

  return (
    <div>
      <DayPicker
        selected={selectedDate}
        onDayClick={handleDateClick}
        disabled={{ before: new Date() }}
        modifiers={{
          available: (date) => isDateAvailable(date),
          selectedAvailable: (date) =>
            selectedDate &&
            isDateAvailable(date) &&
            formatDate(date) === formatDate(selectedDate),
        }}
        modifiersStyles={{
          available: {
            backgroundColor: "#e6fffa",
            color: "#047857",
            fontWeight: "bold",
          },
          selectedAvailable: {
            backgroundColor: "#047857",
            color: "#ffffff",
            fontWeight: "bold",
          },
          selected: {
            backgroundColor: "#047857",
            color: "#ffffff",
            fontWeight: "bold",
          },
        }}
        styles={{
          day: { margin: "0.2em" },
          caption: { color: "#374151" },
        }}
      />
    </div>
  );
};

export default AvailabilityDayPicker;
