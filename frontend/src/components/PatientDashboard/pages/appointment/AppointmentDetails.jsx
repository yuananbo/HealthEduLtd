import React, { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiEdit3,
  FiCheckSquare,
  FiMessageSquare,
  FiMapPin,
} from "react-icons/fi";
import useAppointmentDetailsPatient from "../../../../hooks/useAppointmentDetailsPatient";
import useTherapistDetails from "../../../../hooks/useTherapistDetails";
import Loading from "../../../utilities/Loading";
import RescheduleAppointment from "./RescheduleAppointment";
import Input from "../../../common/forms/Input";
import Button from "../../../common/Button";
import toast from "react-hot-toast";
import api from "../../../../utils/api";
import { UserContext } from "../../../../context/UserContext";

const StarButton = ({ filled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-3xl transition-colors ${
      filled ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"
    }`}
    aria-label="Select rating star"
  >
    ★
  </button>
);
import { getPaymentRedirectUrl } from "../../../../utils/paymentFlow";

const DEFAULT_CONSULTATION_AMOUNT = 5000;
const DEFAULT_CURRENCY = "RWF";

const AppointmentDetails = () => {
  const [showNotes, setShowNotes] = useState(false);
  const [consultationPaying, setConsultationPaying] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitAnonymously, setSubmitAnonymously] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const { appointment, loading: appointmentLoading } =
    useAppointmentDetailsPatient(id);

  const { loading, therapist } = useTherapistDetails(
    appointment?.data?.therapist
  );

  useEffect(() => {
    const fetchExistingReview = async () => {
      const therapistId = appointment?.data?.therapist;
      const patientId = currentUser?.data?.user?._id;
      const isCompleted = appointment?.data?.status === "Completed";

      if (!therapistId || !patientId || !isCompleted) {
        setExistingReview(null);
        return;
      }

      try {
        setRatingsLoading(true);
        const response = await api.get(`/rating/${therapistId}`);
        const ratings = Array.isArray(response?.data?.therapist?.ratings)
          ? response.data.therapist.ratings
          : [];
        const matchedReview = ratings.find(
          (item) =>
            String(item?.appointment?._id || item?.appointment) === String(id)
        );

        setExistingReview(matchedReview || null);
        if (matchedReview) {
          setReviewRating(Number(matchedReview.rating) || 0);
          setReviewText(matchedReview.review || "");
          setSubmitAnonymously(Boolean(matchedReview.isAnonymous));
        } else {
          setSubmitAnonymously(false);
        }
      } catch (fetchError) {
        console.error("Error fetching therapist ratings:", fetchError);
      } finally {
        setRatingsLoading(false);
      }
    };

    fetchExistingReview();
  }, [
    id,
    appointment?.data?.status,
    appointment?.data?.therapist,
    currentUser?.data?.user?._id,
  ]);

  if (appointmentLoading || loading) {
    return <Loading />;
  }

  const handleCancel = async () => {
    try {
      if (!id) return;
      const confirm = window.confirm(
        "Cancel this appointment? This action cannot be undone."
      );
      if (!confirm) return;

      await api.patch(`/patient/appointments/${id}/cancel`);
      toast.success("Appointment cancelled");
      navigate("/patient/appointments");
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Failed to cancel appointment";
      toast.error(message);
    }
  };

  const handleSaveNotes = () => {
    // Implement save notes logic
    console.log("Notes saved:", notes);
    setShowNotes(false);
  };

  const handleSubmitReview = async () => {
    if (!appointment?.data?.therapist) return;
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error("Please select a rating before submitting");
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await api.post(`/rating/${appointment.data.therapist}`, {
        appointmentId: id,
        rating: reviewRating,
        review: reviewText.trim(),
        isAnonymous: submitAnonymously,
      });

      setExistingReview(response?.data?.rating || {
        rating: reviewRating,
        review: reviewText.trim(),
        isAnonymous: submitAnonymously,
        createdAt: new Date().toISOString(),
      });
      toast.success("Thank you for your feedback");
    } catch (submitError) {
      const message =
        submitError?.response?.data?.message ||
        submitError?.message ||
        "Failed to submit your review";
      toast.error(message);
    } finally {
      setSubmittingReview(false);
  }
};
      
  const handlePayConsultationFee = async () => {
    if (!id) return;
    try {
      setConsultationPaying(true);
      const response = await api.post(
        `/patient/appointments/${id}/pay-consultation`,
        {
          amount: DEFAULT_CONSULTATION_AMOUNT,
          currency: DEFAULT_CURRENCY,
        }
      );
      const pr = response.data?.paymentResponse;
      const redirect = getPaymentRedirectUrl(pr);
      if (redirect) {
        window.location.href = redirect;
      } else {
        toast.success("Consultation fee paid successfully.");
        navigate("/patient/payment-success-page");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Could not process payment";
      toast.error(msg);
    } finally {
      setConsultationPaying(false);
    }
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
                    : appointment?.data?.status === "Completed"
                    ? "bg-blue-100 text-blue-800"
                    : appointment?.data?.status === "Waiting for Payment"
                    ? "bg-orange-100 text-orange-800"
                    : appointment?.data?.status === "Rescheduled"
                    ? "bg-purple-100 text-purple-800"
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
                      : appointment?.data?.appointmentType === "online"
                        ? "Online Meeting"
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
                  to="/patient/home-care"
                  className="bg-greenPrimary hover:bg-hoverColor text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
                >
                  Book Appointment
                </Link>
              </div>
            ) : appointment?.data?.status === "Completed" ? (
              <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Appointment Completed
                    </h3>
                    {appointment?.data?.consultationFeePaid ? (
                      <p className="text-sm text-green-600 mt-1">
                        Consultation fee has been paid. Thank you.
                      </p>
                    ) : (
                      <p className="text-sm text-green-600 mt-1">
                        Please pay the consultation fee for this visit (booking
                        fee was paid when you scheduled).
                      </p>
                    )}
                  </div>
                  {!appointment?.data?.consultationFeePaid && (
                    <button
                      type="button"
                      onClick={handlePayConsultationFee}
                      disabled={consultationPaying}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-2 px-6 rounded transition duration-150 ease-in-out whitespace-nowrap"
                    >
                      {consultationPaying ? "Processing…" : "Pay Consultation Fee"}
                    </button>
                  )}
                </div>
              </div>
            ) : appointment?.data?.status === "Cancelled" ? null : (
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

          {appointment?.data?.status === "Waiting for Payment" && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-orange-800">
                    Awaiting payment
                  </h3>
                  <p className="text-sm text-orange-600 mt-1">
                    Complete checkout to confirm this appointment. You will be
                    redirected to our payment provider when available.
                  </p>
                </div>
                <NavLink
                  to={`/patient/appointments/${id}/pay`}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition duration-150 ease-in-out whitespace-nowrap text-center"
                >
                  Go to payment
                </NavLink>
              </div>
            </div>
          )}

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
            </div>
          )}

          {appointment?.data?.status === "Completed" && (
            <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-5">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Rate Your Therapist
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Share a star rating and an optional review for this completed appointment.
              </p>

              {ratingsLoading ? (
                <p className="text-sm text-gray-500">Loading your review...</p>
              ) : existingReview ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-3xl ${
                          star <= Number(existingReview?.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-700">
                    {(existingReview?.review || "").trim()
                      ? existingReview.review
                      : "You submitted a rating without a written review."}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted: {new Date(existingReview?.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                  {existingReview?.isAnonymous ? (
                    <p className="text-xs text-gray-600">
                      You submitted this rating anonymously. Your name is not shown to the
                      therapist.
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarButton
                        key={star}
                        filled={star <= reviewRating}
                        onClick={() => setReviewRating(star)}
                      />
                    ))}
                  </div>

                  <Input
                    value={reviewText}
                    handleChange={(e) => setReviewText(e.target.value)}
                    labelText="Review (optional)"
                    labelFor="review"
                    id="review"
                    name="review"
                    type="textarea"
                    component="textarea"
                    placeholder="How was your experience with this therapist?"
                  />

                  <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-greenPrimary focus:ring-greenPrimary"
                      checked={submitAnonymously}
                      onChange={(e) => setSubmitAnonymously(e.target.checked)}
                    />
                    <span>
                      Submit anonymously — the therapist will not see your name on this review.
                    </span>
                  </label>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmitReview}
                      label={submittingReview ? "Submitting..." : "Submit Review"}
                      variant="filled"
                      disabled={submittingReview}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
