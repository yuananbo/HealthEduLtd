import { Route, Routes } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout";
import ForgotPassword from "../PatientDashboard/pages/ForgotPassword";
import ResetPassword from "../PatientDashboard/pages/ResetPassword";
import AdminAccount from "./pages/account/AdminAccount";
import NotFound from "../../pages/NotFound";
import Dashboard from "./pages/dashboard/Dashboard";
import AllTherapist from "./pages/therapists/AllTherapist";
import TherapistDetails from "./pages/therapists/TherapistDetails";
import AllUsers from "./pages/users/AllUsers";
import UserDetails from "./pages/users/UserDetails";

const AdminDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users">
          <Route index element={<AllUsers />} />
          <Route path=":id" element={<UserDetails />} />
        </Route>
        <Route path="therapists">
          <Route index element={<AllTherapist />} />
          <Route path=":id" element={<TherapistDetails />} />
        </Route>
        <Route path="profile" element={<AdminAccount />} />
      </Route>
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AdminDashboard;
