import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiEdit3,
  FiCheckSquare,
  FiMessageSquare,
  FiMapPin,
  FiMessageCircle,
} from "react-icons/fi";
import useAppointmentDetailsPatient from "../../../../hooks/useAppointmentDetailsPatient";
import useTherapistDetails from "../../../../hooks/useTherapistDetails";
import Loading from "../../../utilities/Loading";
import RescheduleAppointment from "./RescheduleAppointment";
import Input from "../../../common/forms/Input";
import Button from "../../../common/Button";

const AppointmentDetails = () => {
  const [showNotes, setShowNotes] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const { id } = useParams();
  const {
    appointment,
    loading: appointmentLoading,
    error: appointmentError,
  } = useAppointmentDetailsPatient(id);

  const { loading, error, therapist } = useTherapistDetails(
    appointment?.data?.therapist
  );

  if (appointmentLoading || loading) {
    return <Loading />;
  }

  const handleCancel = () => {
    // Implement cancel logic
    console.log("Appointment cancelled");
  };

  const handleReschedule = () => {
    // Implement reschedule logic
    console.log("Reschedule appointment");
  };

  const handleSaveNotes = () => {
    // Implement save notes logic
    console.log("Notes saved:", notes);
    setShowNotes(false);
  };

  const handleStartChat = () => {
    // Implement chat logic
    console.log("Starting chat with therapist");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Appointment Details
      </h1>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              {therapist?.data?.profilePicture ? (
                <img
                  src={therapist?.data?.profilePicture}
                  alt={therapist?.data?.firstName}
                  className="w-16 h-16 rounded-full mr-4"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-xl mr-3">
                  {therapist?.data?.firstName
                    ? therapist?.data?.firstName[0].toUpperCase()
                    : "U"}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {therapist?.data?.firstName} {therapist?.data?.lastName}
                </h2>
                <p className="text-gray-600">
                  {therapist?.data?.specialization}
                </p>
                <p className="text-gray-600 flex items-center mt-1">
                  <FiMapPin className="text-greenPrimary mr-2" />
                  {therapist?.data?.address?.country}{" "}
                  {therapist?.data?.address?.city}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  appointment?.data?.status === "Accepted"
                    ? "bg-green-100 text-green-800"
                    : appointment?.data?.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {appointment?.data?.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center">
              <FiCalendar className="text-greenPrimary mr-2" />
              <span className="text-gray-700">
                {new Date(appointment?.data?.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center">
              <FiClock className="text-greenPrimary mr-2" />
              <span className="text-gray-700">{appointment?.data?.time}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Appointment Details
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Service</p>
                  <p className="text-gray-800 font-medium flex items-center">
                    <FiCheckSquare className="text-greenPrimary mr-2" />
                    {appointment?.data?.service}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Reason</p>
                  <p className="text-gray-800 font-medium flex items-center">
                    <FiMessageSquare className="text-greenPrimary mr-2" />
                    {appointment?.data?.purpose}
                  </p>
                </div>
              </div>
              {appointment?.data?.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">Notes</p>
                  <p className="text-gray-800 font-medium flex items-start">
                    <FiEdit3 className="text-greenPrimary mr-2 mt-1 flex-shrink-0" />
                    {appointment?.data?.notes}
                  </p>
                </div>
              )}
              {appointment?.data?.appointmentType && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">Appointment Type</p>
                  <p className="text-gray-800 font-medium flex items-center">
                    <FiMapPin className="text-greenPrimary mr-2" />
                    {appointment?.data?.appointmentType === "home-care"
                      ? "Home Care Visit"
                      : "In-Person"}
                  </p>
                </div>
              )}
              {appointment?.data?.appointmentType === "home-care" &&
                appointment?.data?.homeAddress && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-1">Home Address</p>
                    <div className="text-gray-800 font-medium flex items-start">
                      <FiMapPin className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        {appointment.data.homeAddress.street && (
                          <p>{appointment.data.homeAddress.street}</p>
                        )}
                        {appointment.data.homeAddress.district && (
                          <p>{appointment.data.homeAddress.district}</p>
                        )}
                        <p>
                          {appointment.data.homeAddress.city}
                          {appointment.data.homeAddress.country &&
                            `, ${appointment.data.homeAddress.country}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {appointment?.data?.status === "Declined" ? (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <p className="text-sm text-gray-600 mb-1 sm:mb-0">
                  Your appointment has been declined. Please book a new
                  appointment.
                </p>
                <Link
                  to="/patient/therapist-list"
                  className="bg-greenPrimary hover:bg-hoverColor text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                >
                  Book Appointment
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setIsRescheduleModalOpen(true)}
                  label={"Reschedule"}
                  variant="filled"
                  color="yellow-500"
                />

                <RescheduleAppointment
                  isOpen={isRescheduleModalOpen}
                  onClose={() => setIsRescheduleModalOpen(false)}
                  appointment={appointment?.data}
                  therapistId={appointment?.data?.therapist}
                />

                <Button
                  onClick={handleCancel}
                  label={"Cancel Appointment"}
                  variant="filled"
                  color="red-500"
                />
              </div>
            )}
          </div>

          {appointment?.data?.status === "Accepted" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Appointment Notes
                </h3>
                {showNotes ? (
                  <div>
                    <Input
                      value={notes}
                      handleChange={(e) => setNotes(e.target.value)}
                      labelText="Notes"
                      labelFor="notes"
                      id="notes"
                      name="notes"
                      type="textarea"
                      component="textarea"
                      placeholder="Add your notes here..."
                      rows="4"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        onClick={() => setShowNotes(false)}
                        label={"Cancel"}
                        variant="outlined"
                      />
                      <Button
                        onClick={handleSaveNotes}
                        variant="filled"
                        label={"Save Notes"}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNotes(true)}
                    className="flex items-center text-greenPrimary hover:text-hoverColor transition duration-150 ease-in-out"
                  >
                    <FiEdit3 className="mr-1" /> Add Notes
                  </button>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Message Therapist
                </h3>
                <button
                  onClick={handleStartChat}
                  className="flex items-center bg-greenPrimary hover:bg-hoverColor text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                >
                  <FiMessageCircle className="mr-2" /> Start Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
