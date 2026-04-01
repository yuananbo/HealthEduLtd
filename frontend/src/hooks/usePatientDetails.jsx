import { useState, useContext, useCallback } from "react";
import { UserContext } from "../context/UserContext";
import api from "../utils/api";

const usePatientDetails = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patient, setPatient] = useState(null);
  const { currentUser } = useContext(UserContext);

  const fetchPatientDetails = useCallback(
    async (patientId) => {
      if (!patientId) {
        setError("No patient ID provided");
        setLoading(false);
        return;
      }
      if (!currentUser?.token) {
        setError("No user token available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/patient/${patientId}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        setPatient(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching patient details:", err);
        setError(
          err.response?.data?.message || "Failed to fetch patient details"
        );
        setLoading(false);
      }
    },
    [currentUser?.token]
  );

  return { loading, error, patient, fetchPatientDetails };
};

export default usePatientDetails;
