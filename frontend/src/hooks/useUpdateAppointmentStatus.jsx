import { useState, useContext } from "react";
import api from "../utils/api";
import { UserContext } from "../context/UserContext";

const useUpdateAppointmentStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useContext(UserContext);

  const updateStatus = async (appointmentId, newStatus) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.patch(
        `/therapist/appointments/${appointmentId}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );

      setLoading(false);
      // console.log("====================================");
      // console.log(response.data);
      // console.log("====================================");
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message ||
          "An error occurred while updating the appointment status"
      );
      throw err;
    }
  };

  return { updateStatus, loading, error };
};

export default useUpdateAppointmentStatus;
