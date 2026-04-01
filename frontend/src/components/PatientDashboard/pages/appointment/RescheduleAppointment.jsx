import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { toast } from "react-hot-toast";
import AvailabilityDayPicker from "../../../common/widgets/Calender";
import AvailableTimeSlots from "../../../common/widgets/TimeSlots";
import useDataFetching from "../../../../hooks/useFech";
import Loading from "../../../utilities/Loading";
import api from "../../../../utils/api";
import { UserContext } from "../../../../context/UserContext";
import Input from "../../../common/forms/Input";
import Button from "../../../common/Button";

const RescheduleAppointment = ({
  isOpen,
  onClose,
  appointment,
  therapistId,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [note, setNote] = useState("");
  const [formattedData, setFormattedData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useContext(UserContext);

  const [loading, error, data, fetchData] = useDataFetching(
    `/therapist/availability/${therapistId}`
  );

  console.log("current user", currentUser.token);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  useEffect(() => {
    if (data && data.status === "success" && data.activeAvailability) {
      const formattedAvailabilities =
        data.activeAvailability.availabilities.map((availability) => ({
          date: moment(availability.date).format("YYYY-MM-DD"),
          times: availability.times,
        }));
      setFormattedData({ availabilities: formattedAvailabilities });
    }
  }, [data]);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSlotSelect = (time) => {
    setSelectedTime(time);
  };

  const updateAvailability = async (therapistId, date, time) => {
    try {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      const formattedTime = time.length === 4 ? `0${time}` : time;
      await api.put(
        `/therapist/availability/${therapistId}`,
        {
          date: formattedDate,
          time: formattedTime,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "Error updating availability:",
        error.response?.data?.message || error.message
      );
    }
  };

  const updateLocalAvailability = (date, time) => {
    if (!formattedData) return;

    const updatedAvailabilities = formattedData.availabilities.map(
      (availability) => {
        if (availability.date === date) {
          return {
            ...availability,
            times: availability.times.map((t) => {
              if (t.time === time) {
                return { ...t, isActive: false };
              }
              return t;
            }),
          };
        }
        return availability;
      }
    );

    setFormattedData({ availabilities: updatedAvailabilities });
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both a date and time");
      return;
    }

    const appointmentDate = moment(appointment.date);
    const currentDate = moment();
    const hoursDifference = currentDate.diff(appointmentDate, "hours");

    if (hoursDifference > 48) {
      toast.error(
        "Appointments can only be rescheduled within 48 hours of booking"
      );
      return;
    }

    const newDate = moment(selectedDate).format("YYYY-MM-DD");
    const newTime = selectedTime;

    try {
      setIsSubmitting(true);
      await rescheduleAppointment(appointment._id, newDate, newTime, note);
      toast.success("Appointment rescheduled successfully");
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error("Error rescheduling appointment");
      console.error("Error rescheduling appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rescheduleAppointment = async (
    appointmentId,
    newDate,
    newTime,
    reason
  ) => {
    try {
      // Make sure newTime is a string, not an object
      const timeString = typeof newTime === "object" ? newTime.time : newTime;

      const response = await api.put(
        `/patient/appointments/${appointmentId}`,
        {
          newDate,
          newTime: timeString, // Send the time as a string
          reason,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );

      if (response.data.success) {
        updateAvailability(therapistId, newDate, timeString);
        updateLocalAvailability(newDate, timeString);
      } else {
        throw new Error(
          response.data.message || "Failed to reschedule appointment"
        );
      }
    } catch (error) {
      console.error("Reschedule error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to reschedule appointment"
      );
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) return <Loading />;
  if (error)
    return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Reschedule Appointment
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Note: Appointments can only be rescheduled if they were booked
                within the last 48 hours.
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Current Appointment
                </h3>
                <div className="bg-gray-100 p-4 rounded-md">
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {moment(appointment?.date).format("MMMM D, YYYY")}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{" "}
                    {appointment?.time}
                  </p>
                </div>
              </div>

              {formattedData && formattedData.availabilities && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Select New Date and Time
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AvailabilityDayPicker
                        availabilities={formattedData?.availabilities}
                        onDateClick={handleDateClick}
                      />
                      <div>
                        {selectedDate ? (
                          <AvailableTimeSlots
                            selectedDate={selectedDate}
                            availabilities={formattedData.availabilities}
                            onTimeSlotSelect={handleTimeSlotSelect}
                          />
                        ) : (
                          <p className="text-gray-500 italic">
                            Please select a date first
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Input
                      id="note"
                      name="note"
                      labelText="Add a Note (Optional)"
                      labelFor="note"
                      type="textarea"
                      component="textarea"
                      value={note}
                      handleChange={(e) => setNote(e.target.value)}
                      placeholder="Add any additional information or notes about rescheduling"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      label={"Cancel"}
                      variant="outlined"
                      onClick={onClose}
                    />

                    <Button
                      disabled={!selectedDate || !selectedTime || isSubmitting}
                      label={
                        isSubmitting
                          ? "Rescheduling..."
                          : "Reschedule Appointment"
                      }
                      variant="filled"
                      onClick={handleSubmit}
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RescheduleAppointment;
