import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../../../utils/api";
import toast from "react-hot-toast";
import AvailabilityDayPicker from "../../../common/widgets/AvailabilityDayPicker";
import {
  formatAvailabilityDateLabel,
  localCalendarDateToYmd,
} from "../../../../utils/availabilityDate";

const CreateAvailability = () => {
  const [availabilityName, setAvailabilityName] = useState("");
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDateClick = (date) => {
    if (dates.length >= 7) {
      toast.error("You can only select up to 7 dates");
      return;
    }
    const ymd = localCalendarDateToYmd(date);
    if (!ymd || dates.some((d) => d.date === ymd)) return;
    setDates([...dates, { date: ymd, times: [] }]);
  };

  const addTimeSlot = (dateIndex) => {
    const updatedDates = [...dates];
    updatedDates[dateIndex].times.push("");
    setDates(updatedDates);
  };

  const handleTimeChange = (dateIndex, timeIndex, value) => {
    const updatedDates = [...dates];
    updatedDates[dateIndex].times[timeIndex] = value;
    setDates(updatedDates);
  };

  const removeTimeSlot = (dateIndex, timeIndex) => {
    const updatedDates = [...dates];
    updatedDates[dateIndex].times = updatedDates[dateIndex].times.filter(
      (_, i) => i !== timeIndex
    );
    setDates(updatedDates);
  };

  const removeDate = (dateIndex) => {
    const updatedDates = dates.filter((_, i) => i !== dateIndex);
    setDates(updatedDates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dates.length || !availabilityName) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await api.post("/therapist/availability", {
        dates,
        availabilityName,
      });

      toast.success("Availability created successfully");
      setDates([]);
      setAvailabilityName("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/therapist/availability"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        ← Back to Availability
      </Link>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Create Availability
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Availability Name
          </h2>
          <input
            type="text"
            value={availabilityName}
            onChange={(e) => setAvailabilityName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="Enter availability name"
          />
        </div>

        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Select Dates
          </h2>
          <AvailabilityDayPicker
            onDateClick={handleDateClick}
            selectedDates={dates.map((d) => d.date)}
          />
        </div>

        {dates.map((date, dateIndex) => (
          <div key={dateIndex} className="bg-white rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                {formatAvailabilityDateLabel(date.date)}
              </h2>
              <button
                type="button"
                onClick={() => removeDate(dateIndex)}
                className="text-red-500 hover:text-red-700"
              >
                Remove Date
              </button>
            </div>
            {date.times.map((timeSlot, timeIndex) => (
              <div key={timeIndex} className="flex items-center mb-2">
                <input
                  type="time"
                  value={timeSlot}
                  onChange={(e) =>
                    handleTimeChange(dateIndex, timeIndex, e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
                <button
                  type="button"
                  onClick={() => removeTimeSlot(dateIndex, timeIndex)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addTimeSlot(dateIndex)}
              className="mt-4 bg-blue-500 text-white rounded-lg p-2"
            >
              Add Time Slot
            </button>
          </div>
        ))}

        <div className="bg-white rounded-lg p-6 text-right">
          <button
            type="submit"
            className={`${
              loading ? "bg-gray-400" : "bg-blue-500"
            } text-white rounded-lg p-2`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Availability"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAvailability;
