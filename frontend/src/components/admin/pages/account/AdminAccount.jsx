import { useContext } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";
import { logout } from "../../../../services/AuthServices";
import { adminBaseURL } from "../../../../utils/adminApi";

const AdminAccount = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const admin = currentUser?.data?.user;

  const handleLogout = async () => {
    try {
      await logout(`${adminBaseURL}/logout`);
      setCurrentUser(null);
      toast.success("Logged out");
      navigate("/admin/login", { replace: true });
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/" className="text-sm text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-800">Admin Account</h1>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Profile</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Name</p>
            <p className="mt-1 text-sm text-gray-800">
              {`${admin?.firstName || ""} ${admin?.lastName || ""}`.trim() || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
            <p className="mt-1 text-sm text-gray-800">{admin?.email || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Role</p>
            <p className="mt-1 text-sm text-gray-800">{admin?.role || "-"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Last Login
            </p>
            <p className="mt-1 text-sm text-gray-800">
              {admin?.lastLogin
                ? new Date(admin.lastLogin).toLocaleString()
                : "-"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Session</h2>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Log Out
        </button>
      </section>
    </div>
  );
};

export default AdminAccount;
