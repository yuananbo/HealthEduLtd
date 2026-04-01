// hooks/useTherapistDetails.js
import { useState, useEffect, useContext } from "react";
import api from "../utils/api";
import { UserContext } from "../context/UserContext";

const useTherapistDetails = (therapistId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [therapist, setTherapist] = useState(null);
  const { currentUser } = useContext(UserContext);

  useEffect(() => {
    const fetchTherapistDetails = async () => {
      if (!therapistId) {
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
        const response = await api.get(`/therapist/${therapistId}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        setTherapist(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching therapist details:", err);
        setError(
          err.response?.data?.message || "Failed to fetch therapist details"
        );
        setLoading(false);
      }
    };

    fetchTherapistDetails();
  }, [therapistId, currentUser]);

  return { loading, error, therapist };
};

export default useTherapistDetails;
