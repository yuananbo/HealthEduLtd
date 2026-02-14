import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { FaRegCalendarTimes, FaHome } from "react-icons/fa";
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

const BookHomeCare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { therapist } = location.state;
  const { currentUser } = useContext(UserContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [load, setLoad] = useState(false);
  const [formattedData, setFormattedData] = useState(null);
  const [formData, setFormData] = useState({
    service: "Home Care Rehab",
    purpose: "",
    notes: "",
  });
  const [homeAddress, setHomeAddress] = useState({
    country: "",
    city: "",
    district: "",
    street: "",
  });

  const [loading, error, data] = useDataFetching(
    `/therapist/availability/${therapist.id}`
  );

  // Pre-fill home address from patient profile if available
  useEffect(() => {
    if (currentUser && currentUser.user) {
      const user = currentUser.user;
      if (user.address) {
        setHomeAddress({
          country: user.address.country || "",
          city: user.address.city || "",
          district: user.address.district || "",
          street: user.address.street || "",
        });
      }
    }
  }, [currentUser]);

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

  useEffect(() => {
    const pendingBooking = localStorage.getItem("pendingHomeCareBooking");
    if (pendingBooking && formattedData) {
      const { therapistId, date, time } = JSON.parse(pendingBooking);
      updateAvailability(therapistId, date, time).then(() => {
        updateLocalAvailability(date, time);
        localStorage.removeItem("pendingHomeCareBooking");
        toast.success("Payment successful. Home care appointment booked.");
        navigate("/patient/payment-success-page");
      });
    }
  }, [formattedData]);

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

  const handleAddressChange = (e) => {
    setHomeAddress({
      ...homeAddress,
      [e.target.name]: e.target.value,
    });
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

  const bookHomeCareAppointment = async () => {
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
          appointmentType: "home-care",
          homeAddress: homeAddress,
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

      if (
        response.data.paymentResponse &&
        response.data.paymentResponse.meta.authorization.redirect
      ) {
        localStorage.setItem(
          "pendingHomeCareBooking",
          JSON.stringify({
            therapistId: therapist.id,
            date: moment(selectedDate).format("YYYY-MM-DD"),
            time: selectedTime?.time,
          })
        );

        window.location.href =
          response.data.paymentResponse.meta.authorization.redirect;
      } else {
        const formattedDate = moment(selectedDate).format("YYYY-MM-DD");
        const formattedTime =
          selectedTime?.time.length === 4
            ? `0${selectedTime?.time}`
            : selectedTime?.time;
        await updateAvailability(therapist.id, formattedDate, formattedTime);
        updateLocalAvailability(formattedDate, formattedTime);
        toast.success("Home care appointment booked successfully");
        navigate("/patient/payment-success-page");
      }
    } catch (err) {
      console.error("Error booking home care appointment:", err);
      toast.error(
        err.response?.data?.error || "Error booking home care appointment"
      );
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

    if (!homeAddress.country || !homeAddress.city) {
      toast.error("Please provide at least your country and city for the home address");
      return;
    }

    await bookHomeCareAppointment();
  };

  if (loading) return <Loading />;

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
          We couldn&apos;t find any open slots at the moment.
        </p>
        <Link to="/patient/home-care">
          <Button label="Back to Home Care" variant="filled" />
        </Link>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
              <FaHome className="text-lg" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">
              Book Home Care Visit
            </h1>
          </div>
          <p className="text-gray-500 ml-13">
            A therapist will visit your home for rehabilitation
          </p>
        </div>
        <TherapistCard therapist={therapist} />
      </div>

      {formattedData && formattedData.availabilities && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date & Time Selection */}
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

          {/* Home Address Section */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-700 flex items-center">
              <FaHome className="text-blue-500 mr-2" />
              Home Address
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              The therapist will visit this address. We&apos;ve pre-filled it from
              your profile if available.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                handleChange={handleAddressChange}
                value={homeAddress.country}
                labelText="Country *"
                labelFor="country"
                id="country"
                name="country"
                type="text"
                isRequired={true}
                placeholder="e.g. Rwanda"
              />
              <Input
                handleChange={handleAddressChange}
                value={homeAddress.city}
                labelText="City *"
                labelFor="city"
                id="city"
                name="city"
                type="text"
                isRequired={true}
                placeholder="e.g. Kigali"
              />
              <Input
                handleChange={handleAddressChange}
                value={homeAddress.district}
                labelText="District"
                labelFor="district"
                id="district"
                name="district"
                type="text"
                isRequired={false}
                placeholder="e.g. Gasabo"
              />
              <Input
                handleChange={handleAddressChange}
                value={homeAddress.street}
                labelText="Street / Detailed Address"
                labelFor="street"
                id="street"
                name="street"
                type="text"
                isRequired={false}
                placeholder="e.g. KG 123 St, House No. 5"
              />
            </div>
          </div>

          {/* Appointment Details */}
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
                placeholder="Reason for home care visit"
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
                placeholder="Any additional notes, e.g. parking instructions, accessibility info"
                component="textarea"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg p-6 text-white">
            <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-3xl font-bold">5,000 RWF</p>
                <p className="text-sm opacity-75 mt-1">Home visit cost</p>
              </div>
              <div className="bg-white text-blue-600 py-2 px-4 rounded-full font-semibold">
                Secure Payment
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={load}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-lg font-semibold transition duration-150 ease-in-out"
            >
              {load ? "Booking..." : "Book Home Visit"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookHomeCare;
