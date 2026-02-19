import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import NotFound from "../../pages/NotFound";
import TherapistDashboardLayout from "./layout/TherapistDashboardLayout";
import ProfilePage from "./pages/profile/ProfilePage";
import SuccessPage from "../auth/therapist/signup/SuccessPage";
import { UserContext } from "../../context/UserContext";
import Availabilities from "./pages/availability/Availabilities";
import CreateAvailability from "./pages/availability/CreateAvailability";
import EditAvailability from "./pages/availability/EditAvailability";
import Appointments from "./pages/appointments/Appointments";
import AppointmentDetails from "./pages/appointments/AppointmentDetails";
import Dashboard from "./pages/dasboard/Dashboard";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Loading from "../utilities/Loading";
import AccountStatus from "./pages/AccountStatus";

const TherapistDashboard = () => {
  const { currentUser } = React.useContext(UserContext);
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("/profile");
      setData(response?.data);
      setIsActive(response?.data?.active);
      setIsVerified(response?.data?.isVerified);
    } catch (err) {
      setError(err);
      toast.error(
        "Error fetching profile: " + (err.message || "An error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <h1>Error: {error.message}</h1>;
  }

  if (!isActive || !isVerified) {
    return <AccountStatus isActive={isActive} isVerified={isVerified} />;
  }

  return (
    <Routes>
      <Route path="/" element={<TherapistDashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="availability">
          <Route index element={<Availabilities />} />
          <Route path="create" element={<CreateAvailability />} />
          <Route path=":id/edit" element={<EditAvailability />} />
        </Route>
        <Route path="appointments">
          <Route index element={<Appointments />} />
          <Route path=":id" element={<AppointmentDetails />} />
        </Route>
        <Route path="settings" element={<ProfilePage />} />
      </Route>
      <Route path="/success" element={<SuccessPage success={isActive} />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default TherapistDashboard;
