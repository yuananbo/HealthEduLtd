import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { FaRegCalendarTimes } from "react-icons/fa";
import AvailabilityDayPicker from "../../../common/widgets/Calender";
import useDataFetching from "../../../../hooks/useFech";
import Loading from "../../../utilities/Loading";
import AvailableTimeSlots from "../../../common/widgets/TimeSlots";
import { UserContext } from "../../../../context/UserContext";
import Input from "../../../common/forms/Input";
import TherapistCard from "../../../features/cards/SmallCard";
import toast from "react-hot-toast";
import api from "../../../../utils/api";
import Button from "../../../common/Button";
import { getPaymentRedirectUrl } from "../../../../utils/paymentFlow";

const BookAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { therapist } = location.state;
  const { currentUser } = useContext(UserContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [load, setLoad] = useState(false);
  const [formattedData, setFormattedData] = useState(null);
  const [formData, setFormData] = useState({
    service: "",
    purpose: "",
    notes: "",
  });
  const [loading, error, data, refetchAvailability] = useDataFetching(
    `/therapist/availability/${therapist.id}`
  );

  useEffect(() => {
    if (data && data.status === "success" && data.activeAvailability) {
      const formattedAvailabilities =
        data.activeAvailability.availabilities.map((availability) => ({
          date: moment.utc(availability.date).format("YYYY-MM-DD"),
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const bookAppointment = async () => {
    try {
      setLoad(true);
      const response = await api.post(
        "/patient/appointments",
        {
          therapist: therapist.id,
          date: moment(selectedDate).format("YYYY-MM-DD"),
          time: selectedTime?.time,
          service: formData.service,
          purpose: formData.purpose,
          notes: formData.notes,
          appointmentType: "in-person",
          paymentDetails: {
            amount: 5000,
            currency: "RWF",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const redirect = getPaymentRedirectUrl(response.data.paymentResponse);
      if (redirect) {
        window.location.href = redirect;
      } else {
        toast.success("Appointment booked — payment complete.");
        navigate("/patient/payment-success-page");
      }
    } catch (err) {
      console.error("Error booking appointment:", err);
      if (err?.response?.status === 409) {
        setSelectedTime(null);
        await refetchAvailability();
      }
      toast.error(err.response?.data?.message || "Error booking appointment");
    } finally {
      setLoad(false);
    }
  };

  const addToCalendar = async () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !formData.service ||
      !formData.purpose
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoad(true);
      await api.post(
        "/patient/appointments",
        {
          therapist: therapist.id,
          date: moment(selectedDate).format("YYYY-MM-DD"),
          time: selectedTime?.time,
          service: formData.service,
          purpose: formData.purpose,
          notes: formData.notes,
          appointmentType: "in-person",
          status: "Waiting for Payment",
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(
        "Saved as pending payment. Open the appointment and tap Pay when you're ready."
      );
      navigate("/patient/appointments");
    } catch (err) {
      console.error("Error adding appointment to calendar:", err);
      if (err?.response?.status === 409) {
        setSelectedTime(null);
        await refetchAvailability();
      }
      toast.error(err.response?.data?.message || "Error adding appointment");
    } finally {
      setLoad(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedDate ||
      !selectedTime ||
      !formData.service ||
      !formData.purpose
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    await bookAppointment();
  };

  if (loading) return <Loading />;
  // if (error)
  //   return <div className="text-center text-red-500">Error: {error}</div>;

  if (
    !formattedData ||
    !formattedData?.availabilities ||
    formattedData?.availabilities.length === 0 ||
    data?.activeAvailability?.availabilities.length === 0
  )
    return (
      <div className="max-w-sm mx-auto text-center p-8 bg-white rounded-lg shadow-md">
        <FaRegCalendarTimes className="w-16 h-16 text-blueColor mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          No Availabilities
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't find any open slots at the moment.
        </p>
        <Link to="/patient/therapist-list">
          <Button label={"  Back to Therapist Page"} variant="filled" />
        </Link>
      </div>
    );
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
          Book an Appointment
        </h1>
        <TherapistCard therapist={therapist} />
      </div>
      {formattedData && formattedData.availabilities && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Select Date and Time
            </h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <AvailabilityDayPicker
                  availabilities={formattedData.availabilities}
                  onDateClick={handleDateClick}
                />
              </div>
              <div className="md:w-1/2">
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

          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Appointment Details
            </h2>
            <div className="space-y-4">
              <Input
                handleChange={handleChange}
                value={formData.service}
                labelText="Service"
                labelFor="service"
                id="service"
                name="service"
                type="text"
                isRequired={true}
                placeholder="Type of service"
              />
              <Input
                handleChange={handleChange}
                value={formData.purpose}
                labelText="Purpose"
                labelFor="purpose"
                id="purpose"
                name="purpose"
                isRequired={true}
                placeholder="Reason for appointment"
                component="textarea"
              />
              <Input
                handleChange={handleChange}
                value={formData.notes}
                labelText="Notes (Optional)"
                labelFor="notes"
                id="notes"
                name="notes"
                type="text"
                isRequired={false}
                placeholder="Any additional notes or information for the therapist"
                component="textarea"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={addToCalendar}
              disabled={load}
              className="border-2 border-indigo-600 text-indigo-600 py-3 px-6 rounded-lg hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-lg font-semibold transition duration-150 ease-in-out"
            >
              {load ? "Saving..." : "Add to cart (pay later)"}
            </button>
            <button
              type="submit"
              disabled={load}
              className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-lg font-semibold transition duration-150 ease-in-out"
            >
              {load ? "Booking..." : "Book & Pay Now"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookAppointment;
