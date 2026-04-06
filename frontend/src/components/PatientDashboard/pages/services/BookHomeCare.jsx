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
import TherapistProfileModal from "../therapists/TherapistProfileModal";
import toast from "react-hot-toast";
import api from "../../../../utils/api";
import Button from "../../../common/Button";
import { getPaymentRedirectUrl } from "../../../../utils/paymentFlow";
import { resolveSelectedSlotTime } from "../../../../utils/availabilityDate";

const HOME_CARE_SERVICES = [
  "Physical Therapy",
  "Occupational Therapy",
  "Prosthetics and Orthotics",
  "Family Medicine & Chronic Care",
  "Mental Health",
  "Nutrition",
];

const BookHomeCare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const therapist = location.state?.therapist;
  const selectedHomeCareService = location.state?.selectedHomeCareService;
  const { currentUser } = useContext(UserContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [load, setLoad] = useState(false);
  const [formattedData, setFormattedData] = useState(null);
  const [appointmentType, setAppointmentType] = useState("home-care"); // home-care | online
  const [formData, setFormData] = useState({
    service: selectedHomeCareService || "Physical Therapy",
    purpose: "",
    notes: "",
  });
  const [homeAddress, setHomeAddress] = useState({
    country: "",
    city: "",
    district: "",
    street: "",
  });
  const [therapistModalOpen, setTherapistModalOpen] = useState(false);

  const [loading, , data, refetchAvailability] = useDataFetching(
    therapist?.id ? `/therapist/availability/${therapist.id}` : null
  );

  useEffect(() => {
    if (!therapist) {
      toast.error("Missing therapist details. Please select a therapist again.");
      navigate("/patient/home-care");
    }
  }, [therapist, navigate]);

  useEffect(() => {
    if (
      selectedHomeCareService &&
      HOME_CARE_SERVICES.includes(selectedHomeCareService)
    ) {
      setFormData((prev) => ({ ...prev, service: selectedHomeCareService }));
    }
  }, [selectedHomeCareService]);

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
          // Treat availability.date as UTC date-only to avoid timezone shifting.
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

  const handleServiceChange = (e) => {
    setFormData((prev) => ({ ...prev, service: e.target.value }));
  };

  const handleAddressChange = (e) => {
    setHomeAddress({
      ...homeAddress,
      [e.target.name]: e.target.value,
    });
  };

  const assertHomeBookingFormComplete = () => {
    const slotTime = resolveSelectedSlotTime(selectedTime);
    const missing = [];
    if (!selectedDate || !String(selectedDate).trim()) {
      missing.push("appointment date");
    }
    if (!slotTime) {
      missing.push("time slot");
    }
    if (!formData.service?.trim()) {
      missing.push("service");
    }
    if (!formData.purpose?.trim()) {
      missing.push("purpose");
    }
    if (
      appointmentType === "home-care" &&
      (!homeAddress.country?.trim() || !homeAddress.city?.trim())
    ) {
      missing.push("home address (country and city)");
    }
    if (missing.length) {
      toast.error(`Please complete: ${missing.join(", ")}.`);
      return false;
    }
    return true;
  };

  const bookHomeCareAppointment = async () => {
    const slotTime = resolveSelectedSlotTime(selectedTime);
    try {
      setLoad(true);
      const response = await api.post(
        "/patient/appointments",
        {
          therapist: therapist.id,
          date: moment(selectedDate).format("YYYY-MM-DD"),
          time: slotTime,
          service: formData.service,
          purpose: formData.purpose,
          notes: formData.notes,
          appointmentType,
          ...(appointmentType === "home-care" ? { homeAddress } : {}),
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
      console.error("Error booking home care appointment:", err);
      if (err?.response?.status === 409) {
        setSelectedTime(null);
        await refetchAvailability();
      }
      toast.error(
        err.response?.data?.error || "Error booking home care appointment"
      );
    } finally {
      setLoad(false);
    }
  };

  const addToCalendar = async () => {
    if (!assertHomeBookingFormComplete()) return;
    const slotTime = resolveSelectedSlotTime(selectedTime);

    try {
      setLoad(true);
      await api.post(
        "/patient/appointments",
        {
          therapist: therapist.id,
          date: moment(selectedDate).format("YYYY-MM-DD"),
          time: slotTime,
          service: formData.service,
          purpose: formData.purpose,
          notes: formData.notes,
          appointmentType,
          ...(appointmentType === "home-care" ? { homeAddress } : {}),
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
      toast.error(
        err.response?.data?.error || "Error adding appointment"
      );
    } finally {
      setLoad(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assertHomeBookingFormComplete()) return;
    await bookHomeCareAppointment();
  };

  if (loading) return <Loading />;

  if (
    !therapist ||
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
              Book Assisted Home Care
            </h1>
          </div>
          <p className="text-gray-500 ml-13">
            Choose whether you want a home visit or an online meeting.
          </p>
        </div>
        <TherapistCard
          therapist={therapist}
          onViewDetails={() => setTherapistModalOpen(true)}
        />
      </div>

      {formattedData && formattedData.availabilities && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Mode */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Session Mode
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setAppointmentType("home-care")}
                className={`px-4 py-2 rounded-lg border transition ${
                  appointmentType === "home-care"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-400"
                }`}
              >
                At home (home visit)
              </button>
              <button
                type="button"
                onClick={() => setAppointmentType("online")}
                className={`px-4 py-2 rounded-lg border transition ${
                  appointmentType === "online"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-blue-400"
                }`}
              >
                Online meeting
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              If you choose a home visit, we&apos;ll ask for an address. Online meetings
              don&apos;t require an address.
            </p>
          </div>

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

          {/* Home Address Section (only for home visit) */}
          {appointmentType === "home-care" && (
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
          )}

          {/* Appointment Details */}
          <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Appointment Details
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="service"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Assisted Home Care Service *
                </label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleServiceChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                >
                  {HOME_CARE_SERVICES.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
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

          {/* Submit */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              onClick={addToCalendar}
              disabled={load}
              className="border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-lg font-semibold transition duration-150 ease-in-out"
            >
              {load ? "Saving..." : "Add to cart (pay later)"}
            </button>
            <button
              type="submit"
              disabled={load}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-lg font-semibold transition duration-150 ease-in-out"
            >
              {load ? "Booking..." : "Book & Pay Now"}
            </button>
          </div>
        </form>
      )}

      <TherapistProfileModal
        isOpen={therapistModalOpen}
        onClose={() => setTherapistModalOpen(false)}
        therapistId={therapist?.id}
        summary={therapist}
      />
    </div>
  );
};

export default BookHomeCare;
