import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import api from "../../../../utils/api";
import AvailabilityDayPicker from "../../../common/widgets/AvailabilityDayPicker";

const mapAvailabilityToState = (availability) => ({
  availabilityName: availability?.name || "",
  dates: (availability?.dates || []).map((dateItem) => ({
    date: dateItem.date,
    times: (dateItem.times || []).map((timeItem) => ({
      time: typeof timeItem === "string" ? timeItem : timeItem.time,
      isActive:
        typeof timeItem === "string" ? true : Boolean(timeItem.isActive),
    })),
  })),
});

const EditAvailability = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [availabilityName, setAvailabilityName] = useState("");
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const fromState = location.state?.availability;
        if (fromState) {
          const mapped = mapAvailabilityToState(fromState);
          setAvailabilityName(mapped.availabilityName);
          setDates(mapped.dates);
          return;
        }

        const response = await api.get("/therapist/my-availability");
        const found = (response?.data?.data || []).find((item) => item.id === id);
        if (!found) {
          toast.error("Availability not found");
          navigate("/therapist/availability");
          return;
        }
        const mapped = mapAvailabilityToState(found);
        setAvailabilityName(mapped.availabilityName);
        setDates(mapped.dates);
      } catch (error) {
        toast.error("Failed to load availability");
        navigate("/therapist/availability");
      } finally {
        setBootstrapping(false);
      }
    };

    init();
  }, [id, location.state, navigate]);

  const handleDateClick = (date) => {
    if (dates.length >= 7) {
      toast.error("You can only select up to 7 dates");
      return;
    }
    if (!dates.find((d) => moment(d.date).isSame(date, "day"))) {
      setDates([...dates, { date, times: [] }]);
    }
  };

  const addTimeSlot = (dateIndex) => {
    const updated = [...dates];
    updated[dateIndex].times.push({ time: "", isActive: true });
    setDates(updated);
  };

  const handleTimeChange = (dateIndex, timeIndex, value) => {
    const updated = [...dates];
    updated[dateIndex].times[timeIndex].time = value;
    setDates(updated);
  };

  const removeTimeSlot = (dateIndex, timeIndex) => {
    const updated = [...dates];
    updated[dateIndex].times = updated[dateIndex].times.filter(
      (_, i) => i !== timeIndex
    );
    setDates(updated);
  };

  const removeDate = (dateIndex) => {
    const updated = dates.filter((_, i) => i !== dateIndex);
    setDates(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!availabilityName || !dates.length) {
      toast.error("Please fill in all fields");
      return;
    }

    const hasEmptyTime = dates.some((d) =>
      (d.times || []).some((t) => !t.time || !t.time.trim())
    );
    if (hasEmptyTime) {
      toast.error("Please fill all time slots");
      return;
    }

    try {
      setLoading(true);
      await api.patch(`/therapist/my-availability/${id}`, {
        availabilityName,
        dates,
      });
      toast.success("Availability updated successfully");
      navigate("/therapist/availability");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  if (bootstrapping) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Availability</h1>
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
                {moment(date.date).format("MMMM Do, YYYY")}
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
                  value={timeSlot.time}
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

        <div className="bg-white rounded-lg p-6 text-right space-x-3">
          <button
            type="button"
            onClick={() => navigate("/therapist/availability")}
            className="bg-gray-200 text-gray-700 rounded-lg p-2 px-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${
              loading ? "bg-gray-400" : "bg-indigo-600"
            } text-white rounded-lg p-2 px-4`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAvailability;
