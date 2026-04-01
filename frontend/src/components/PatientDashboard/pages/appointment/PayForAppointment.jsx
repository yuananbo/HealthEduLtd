import React, { useContext, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useAppointmentDetailsPatient from "../../../../hooks/useAppointmentDetailsPatient";
import useTherapistDetails from "../../../../hooks/useTherapistDetails";
import Loading from "../../../utilities/Loading";
import Button from "../../../common/Button";
import toast from "react-hot-toast";
import api from "../../../../utils/api";
import { UserContext } from "../../../../context/UserContext";
import { getPaymentRedirectUrl } from "../../../../utils/paymentFlow";

const DEFAULT_AMOUNT = 5000;
const DEFAULT_CURRENCY = "RWF";

const PayForAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const [paying, setPaying] = useState(false);

  const {
    appointment,
    loading: appointmentLoading,
    error: appointmentError,
  } = useAppointmentDetailsPatient(id);

  const therapistId = appointment?.data?.therapist;
  const { loading: therapistLoading, therapist } =
    useTherapistDetails(therapistId);

  const handlePay = async () => {
    if (!currentUser?.token || !id) return;
    try {
      setPaying(true);
      const response = await api.post(
        `/patient/appointments/${id}/pay`,
        { amount: DEFAULT_AMOUNT, currency: DEFAULT_CURRENCY },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      const pr = response.data?.paymentResponse;
      const redirect = getPaymentRedirectUrl(pr);
      if (redirect) {
        window.location.href = redirect;
      } else {
        toast.success("Payment completed — your appointment is submitted.");
        navigate("/patient/payment-success-page");
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Could not start payment";
      toast.error(msg);
    } finally {
      setPaying(false);
    }
  };

  if (appointmentLoading || (therapistId && therapistLoading)) {
    return <Loading />;
  }

  if (appointmentError || !appointment?.data) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <p className="text-red-600 mb-4">
          {appointmentError || "Could not load this appointment."}
        </p>
        <Link
          to="/patient/appointments"
          className="text-indigo-600 font-medium hover:underline"
        >
          Back to appointments
        </Link>
      </div>
    );
  }

  const apt = appointment.data;
  if (apt.status !== "Waiting for Payment") {
    return (
      <div className="max-w-lg mx-auto p-6">
        <p className="text-gray-700 mb-4">
          This appointment is not awaiting payment (current status:{" "}
          <span className="font-semibold">{apt.status}</span>).
        </p>
        <Link
          to={`/patient/appointments/${id}`}
          className="text-indigo-600 font-medium hover:underline"
        >
          View appointment details
        </Link>
      </div>
    );
  }

  const therapistData = therapist?.data;
  const name = therapistData
    ? `${therapistData.firstName} ${therapistData.lastName}`
    : "Your therapist";

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Checkout</h1>
      <p className="text-gray-600 mb-6">
        Complete payment to confirm your appointment with {name}.
      </p>

      <div className="bg-white shadow rounded-lg p-6 mb-6 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Service</span>
          <span className="font-medium text-gray-900 text-right">
            {apt.service}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Date</span>
          <span className="font-medium text-gray-900">
            {new Date(apt.date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Time</span>
          <span className="font-medium text-gray-900">{apt.time}</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white mb-6">
        <p className="text-sm opacity-90 mb-1">Amount due</p>
        <p className="text-3xl font-bold">
          {DEFAULT_AMOUNT.toLocaleString()} {DEFAULT_CURRENCY}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handlePay}
          label={paying ? "Redirecting…" : "Pay now"}
          variant="filled"
          disabled={paying}
        />
        <Link
          to={`/patient/appointments/${id}`}
          className="inline-flex items-center justify-center px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
};

export default PayForAppointment;
