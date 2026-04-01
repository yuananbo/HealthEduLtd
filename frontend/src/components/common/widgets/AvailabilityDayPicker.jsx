import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const AvailabilityDayPicker = ({ onDateClick, selectedDates }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <div>
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={handleDateClick}
        disabled={{ before: new Date() }}
        styles={{
          day: { margin: "0.2em" },
          caption: { color: "#374151" },
          selected: {
            backgroundColor: "#047857",
            color: "#ffffff",
            fontWeight: "bold",
          },
        }}
      />
    </div>
  );
};

export default AvailabilityDayPicker;
