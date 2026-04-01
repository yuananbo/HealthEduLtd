// hooks/useTherapistDetails.js
import { useState, useEffect, useContext } from "react";
import api from "../utils/api";
import { UserContext } from "../context/UserContext";

const useAppointmentDetails = (appointmentId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const { currentUser } = useContext(UserContext);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!appointmentId) {
        setError("No therapist ID provided");
        setLoading(false);
        return;
      }
      if (!currentUser?.token) {
        setError("No user token available");
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/patient/appointments/${appointmentId}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );
        setAppointment(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching therapist details:", err);
        setError(
          err.response?.data?.message || "Failed to fetch therapist details"
        );
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId, currentUser]);

  return { loading, error, appointment };
};

export default useAppointmentDetails;
