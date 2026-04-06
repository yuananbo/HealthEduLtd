import { useState, useEffect } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiMapPin,
  FiUser,
} from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import useUpdateAppointmentStatus from "../../../../hooks/useUpdateAppointmentStatus";
import usePatientDetails from "../../../../hooks/usePatientDetails";
import useAppointmentDetails from "../../../../hooks/useAppointmentDetails";
import toast from "react-hot-toast";
import Loading from "../../../utilities/Loading";
import Button from "../../../common/Button";
import api from "../../../../utils/api";
import Input from "../../../common/forms/Input";

const formatBloodPressure = (bloodPressure) => {
  if (
    typeof bloodPressure?.systolic === "number" &&
    typeof bloodPressure?.diastolic === "number"
  ) {
    return `${bloodPressure.systolic}/${bloodPressure.diastolic} mmHg`;
  }

  return "Not provided";
};

const formatBloodSugar = (bloodSugar) => {
  if (typeof bloodSugar?.value === "number") {
    return `${bloodSugar.value} ${bloodSugar.unit || ""}`.trim();
  }

  return null;
};

const formatDateValue = (value) => {
  if (!value) return "Not set";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }
  return parsed.toLocaleDateString();
};

const SummarySection = ({ title, isOpen, onToggle, children }) => (
  <div className="rounded-md border border-indigo-100 bg-white overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
    >
      <span className="font-semibold text-gray-800">{title}</span>
      {isOpen ? (
        <FiChevronUp className="text-gray-500" />
      ) : (
        <FiChevronDown className="text-gray-500" />
      )}
    </button>
    {isOpen ? (
      <div className="border-t border-indigo-100 px-4 py-3">{children}</div>
    ) : null}
  </div>
);

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [noteDetails, setNoteDetails] = useState("");
  const [notes, setNotes] = useState([]);
  const [currentStatus, setCurrentStatus] = useState("");
  const [showDeclineWarning, setShowDeclineWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openSections, setOpenSections] = useState({
    profile: true,
    recentHistory: true,
    medicalHistory: false,
    vitals: false,
    medications: false,
    prescriptions: false,
  });

  const {
    appointment,
    loading: appointmentLoading,
    error: appointmentError,
  } = useAppointmentDetails(id);

  const {
    updateStatus,
    loading: updateLoading,
  } = useUpdateAppointmentStatus();

  const {
    patient,
    loading: patientLoading,
    error: patientError,
    fetchPatientDetails,
  } = usePatientDetails();

  useEffect(() => {
    if (appointment?.data?.patient) {
      fetchPatientDetails(appointment?.data?.patient);
    }
  }, [appointment, fetchPatientDetails]);

  useEffect(() => {
    if (appointment?.data?.sessionNotes) {
      setNotes(appointment.data.sessionNotes);
    }
  }, [appointment]);

  useEffect(() => {
    if (appointment?.data?.status) {
      setCurrentStatus(appointment.data.status);
    }
  }, [appointment]);

  if (appointmentLoading || patientLoading) {
    return <Loading />;
  }

  if (appointmentError || patientError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-xl">
          Error: {appointmentError || patientError}
        </p>
      </div>
    );
  }

  const {
    firstName,
    lastName,
    profilePicture,
    patientId,
    gender,
    dateOfBirth,
    height,
    weight,
    bloodType,
    medicalHistory,
    prescriptions,
    vitals,
    medications,
    healthIndicators,
  } = patient?.data || {};
  const patientMedicalHistory = Array.isArray(medicalHistory) ? medicalHistory : [];
  const patientPrescriptions = Array.isArray(prescriptions) ? prescriptions : [];
  const patientVitals = Array.isArray(vitals) ? vitals : [];
  const patientMedications = Array.isArray(medications) ? medications : [];
  const recentHistory = Array.isArray(healthIndicators?.recentHistory)
    ? healthIndicators.recentHistory
    : [];

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === "Declined" && !showDeclineWarning) {
      setShowDeclineWarning(true);
    } else {
      try {
        await updateStatus(appointment?.data?._id, newStatus);
        setCurrentStatus(newStatus);
        setShowDeclineWarning(false);
        toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
      } catch (err) {
        const message =
          err.response?.data?.message ||
          "Failed to update appointment status. Please try again.";
        toast.error(message);
        console.error("Failed to update appointment status:", err);
      }
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!reason || !noteDetails) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/therapist/appointments/${id}/notes`, {
        reason: reason,
        note: noteDetails,
      });
      const updated = response?.data?.data;
      const sessionList = updated?.sessionNotes;
      setNotes(Array.isArray(sessionList) ? sessionList : []);
      setReason("");
      setNoteDetails("");
      toast.success("Note added successfully");
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding note");
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      await updateStatus(appointment?.data?._id, "Completed");
      setCurrentStatus("Completed");
      toast.success("Appointment marked as complete");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to mark appointment as complete. Please try again.";
      toast.error(message);
      console.error("Failed to mark appointment as complete:", err);
    }
  };

  const handleBack = () => {
    navigate("/therapist/appointments");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="mb-8 flex items-center text-indigo-600 hover:text-indigo-900 transition duration-150 ease-in-out"
        >
          <FiArrowLeft className="mr-2" />
          Back to Appointments
        </button>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-indigo-50">
              <h2 className="text-3xl font-bold text-indigo-900">
                Appointment Details
              </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                currentStatus === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : currentStatus === "Accepted"
                  ? "bg-green-100 text-green-800"
                  : currentStatus === "Declined"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {currentStatus}
            </span>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FiUser className="mr-2" />
                  Patient
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt={`${firstName} ${lastName}`}
                      className="h-12 w-12 rounded-full mr-3 object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-xl mr-3">
                      {firstName ? firstName[0].toUpperCase() : ""}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-lg">{`${firstName} ${lastName}`}</p>
                    <p className="text-gray-500 text-sm">
                      Patient ID: {patientId}
                    </p>
                  </div>
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FiCalendar className="mr-2" />
                  Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(appointment?.data?.date).toLocaleDateString()}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FiClock className="mr-2" />
                  Time
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {appointment?.data?.time}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <FiMapPin className="mr-2" />
                  Service
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {appointment?.data?.service}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Reason</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {appointment?.data?.purpose}
                </dd>
              </div>
              {appointment?.data?.notes && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointment?.data?.notes}
                  </dd>
                </div>
              )}
              {appointment?.data?.appointmentType && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <FiMapPin className="mr-2" />
                    Appointment Type
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        appointment?.data?.appointmentType === "home-care"
                          ? "bg-blue-100 text-blue-800"
                          : appointment?.data?.appointmentType === "online"
                            ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {appointment?.data?.appointmentType === "home-care"
                        ? "Home Care Visit"
                        : appointment?.data?.appointmentType === "online"
                          ? "Online Meeting"
                          : "In-Person"}
                    </span>
                  </dd>
                </div>
              )}
              {appointment?.data?.appointmentType === "home-care" &&
                appointment?.data?.homeAddress && (
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-blue-50">
                    <dt className="text-sm font-medium text-blue-700 flex items-center">
                      <FiMapPin className="mr-2" />
                      Home Visit Address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
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
                    </dd>
                  </div>
                )}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-indigo-50">
                <dt className="text-sm font-medium text-indigo-700">
                  Patient Health Summary
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      This view shows patient-entered details that are useful for
                      assessment and treatment planning.
                    </p>
                    <SummarySection
                      title="Profile Details"
                      isOpen={openSections.profile}
                      onToggle={() => toggleSection("profile")}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <p>Gender: {gender || "Not set"}</p>
                        <p>Date of birth: {formatDateValue(dateOfBirth)}</p>
                        <p>Blood type: {bloodType || "Not set"}</p>
                        <p>
                          Height: {typeof height === "number" ? `${height} cm` : "Not set"}
                        </p>
                        <p>
                          Weight: {typeof weight === "number" ? `${weight} kg` : "Not set"}
                        </p>
                      </div>
                    </SummarySection>

                    <SummarySection
                      title="Recent Health History"
                      isOpen={openSections.recentHistory}
                      onToggle={() => toggleSection("recentHistory")}
                    >
                      {recentHistory.length > 0 ? (
                        <div className="space-y-2">
                          {recentHistory.map((entry) => (
                            <div
                              key={entry._id || entry.date}
                              className="rounded-md border border-indigo-100 bg-gray-50 px-3 py-2"
                            >
                              <p className="text-sm font-medium text-gray-800">
                                {entry.date}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                BP: {formatBloodPressure(entry.bloodPressure)}
                                {typeof entry.heartRateBpm === "number"
                                  ? ` • HR: ${entry.heartRateBpm} bpm`
                                  : ""}
                                {formatBloodSugar(entry.bloodSugar)
                                  ? ` • Sugar: ${formatBloodSugar(entry.bloodSugar)}`
                                  : ""}
                                {typeof entry.weightKg === "number"
                                  ? ` • Weight: ${entry.weightKg} kg`
                                  : ""}
                                {typeof entry.painLevel === "number"
                                  ? ` • Pain: ${entry.painLevel}/10`
                                  : ""}
                                {entry.mood ? ` • Mood: ${entry.mood}` : ""}
                                {entry.adlIndependence
                                  ? ` • ADL: ${entry.adlIndependence}`
                                  : ""}
                                {typeof entry.exerciseCompleted === "boolean"
                                  ? ` • Exercise: ${
                                      entry.exerciseCompleted ? "Completed" : "Not completed"
                                    }`
                                  : ""}
                              </p>
                              {entry.notes?.trim() ? (
                                <p className="text-xs text-gray-500 mt-1">
                                  Notes: {entry.notes}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No recent check-in history recorded yet.
                        </p>
                      )}
                    </SummarySection>

                    <SummarySection
                      title="Medical History"
                      isOpen={openSections.medicalHistory}
                      onToggle={() => toggleSection("medicalHistory")}
                    >
                      {patientMedicalHistory.length > 0 ? (
                        <div className="space-y-2">
                          {patientMedicalHistory.map((item, index) => (
                            <div
                              key={`${item?.condition || "history"}-${index}`}
                              className="rounded-md border border-indigo-100 bg-gray-50 px-3 py-2"
                            >
                              <p className="font-medium text-gray-800">
                                {item?.condition || "Unnamed condition"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Diagnosed: {formatDateValue(item?.diagnosedDate)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No medical history recorded in the patient profile.
                        </p>
                      )}
                    </SummarySection>

                    <SummarySection
                      title="Vitals"
                      isOpen={openSections.vitals}
                      onToggle={() => toggleSection("vitals")}
                    >
                      {patientVitals.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {patientVitals.map((vital, index) => (
                            <div
                              key={`${vital?.type || "vital"}-${index}`}
                              className="rounded-md border border-indigo-100 bg-gray-50 px-3 py-2"
                            >
                              <p className="text-xs uppercase tracking-wide text-gray-500">
                                {vital?.type || "Vital"}
                              </p>
                              <p className="font-medium text-gray-800">
                                {vital?.value || "-"}
                                {vital?.unit ? ` ${vital.unit}` : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No vitals recorded in the patient profile.
                        </p>
                      )}
                    </SummarySection>

                    <SummarySection
                      title="Current Medications"
                      isOpen={openSections.medications}
                      onToggle={() => toggleSection("medications")}
                    >
                      {patientMedications.length > 0 ? (
                        <div className="space-y-2">
                          {patientMedications.map((medication, index) => (
                            <div
                              key={`${medication?.name || "medication"}-${index}`}
                              className="rounded-md border border-indigo-100 bg-gray-50 px-3 py-2"
                            >
                              <p className="font-medium text-gray-800">
                                {medication?.name || "Unnamed medication"}
                              </p>
                              <p className="text-sm text-gray-600">
                                {medication?.dosage || "Dosage not set"}
                                {medication?.frequency
                                  ? ` • ${medication.frequency}`
                                  : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No medications recorded in the patient profile.
                        </p>
                      )}
                    </SummarySection>

                    <SummarySection
                      title="Uploaded Prescriptions"
                      isOpen={openSections.prescriptions}
                      onToggle={() => toggleSection("prescriptions")}
                    >
                      {patientPrescriptions.length > 0 ? (
                        <div className="space-y-2">
                          {patientPrescriptions.map((prescription, index) => (
                            <div
                              key={`${prescription?._id || prescription?.url || "prescription"}-${index}`}
                              className="rounded-md border border-indigo-100 bg-gray-50 px-3 py-2"
                            >
                              <p className="font-medium text-gray-800">
                                {prescription?.originalName || "Prescription file"}
                              </p>
                              <p className="text-sm text-gray-600">
                                Uploaded: {formatDateValue(prescription?.uploadedAt)}
                              </p>
                              {prescription?.url ? (
                                <a
                                  href={prescription.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  View file
                                </a>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">
                          No prescriptions uploaded by the patient.
                        </p>
                      )}
                    </SummarySection>
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {currentStatus === "Pending" && (
          <div className="mt-8 flex space-x-4">
            <button
              onClick={() => handleStatusChange("Accepted")}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out"
              disabled={updateLoading}
            >
              {updateLoading ? "Loading..." : "Accept"}
            </button>
            <button
              onClick={() => handleStatusChange("Declined")}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out"
              disabled={updateLoading}
            >
              {updateLoading ? "Loading..." : "Decline"}
            </button>
          </div>
        )}

        {showDeclineWarning && (
          <div
            className="mt-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4"
            role="alert"
          >
            <p className="font-bold">Are you sure?</p>
            <p>
              Do you really want to decline this appointment? This action cannot
              be undone.
            </p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => handleStatusChange("Declined")}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out"
                disabled={updateLoading}
              >
                Yes, Decline
              </button>
              <button
                onClick={() => setShowDeclineWarning(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-150 ease-in-out"
                disabled={updateLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {currentStatus === "Accepted" && (
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 bg-indigo-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Add Note
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Optional</p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <Input
                  labelText={"Appointment Feedback Title"}
                  handleChange={(e) => setReason(e.target.value)}
                  value={reason}
                  placeholder={"e.g Follow up"}
                  labelFor={"reason"}
                  id={"reason"}
                  type={"text"}
                  name={"reason"}
                />
                <Input
                  value={noteDetails}
                  handleChange={(e) => setNoteDetails(e.target.value)}
                  labelText={"Appointment Feedback Description"}
                  labelFor={"noteDetails"}
                  id={"noteDetails"}
                  name={"noteDetails"}
                  type={"textarea"}
                  component="textarea"
                  rows={4}
                />
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleAddNote}
                    label={loading ? "Adding..." : "Add Note"}
                    variant="outlined"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Notes
              </h3>
              <ul className="mt-4">
                {notes.map((note, index) => (
                  <li
                    key={note?._id || `note-${index}`}
                    className="bg-white shadow overflow-hidden sm:rounded-lg mb-4 p-4"
                  >
                    <h4 className="text-md font-medium text-gray-900">
                      {note.reason}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">{note.note}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-8 flex justify-end">
              <Button
                onClick={handleMarkComplete}
                disabled={updateLoading}
                label={updateLoading ? "Updating..." : "Mark as Complete"}
                variant="filled"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetails;
