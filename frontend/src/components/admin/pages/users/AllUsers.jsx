import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";
import Loading from "../../../utilities/Loading";
import { adminBaseURL } from "../../../../utils/adminApi";

const STATUS_STYLES = {
  active: "bg-green-200 text-green-700",
  pending: "bg-yellow-200 text-yellow-700",
  inactive: "bg-red-200 text-red-700",
};

const AllUsers = () => {
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    userType: "all",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });

  const fetchUsers = useCallback(async () => {
    if (!currentUser?.token) {
      return;
    }

    // Keep list state server-driven so search, filters, and pagination always
    // reflect the backend's normalized user data.
    setLoading(true);
    try {
      const response = await axios.get(`${adminBaseURL}/users`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
        params: filters,
      });

      if (response.status === 200) {
        setUsers(response?.data?.data || []);
        setPagination({
          total: response?.data?.total || 0,
          currentPage: response?.data?.currentPage || 1,
          totalPages: response?.data?.totalPages || 1,
        });
      }
    } catch (error) {
      console.error(
        "Error fetching users:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const handleStatusChange = async (userId, userType, nextStatus) => {
    try {
      const response = await axios.patch(
        `${adminBaseURL}/users/${userId}/status`,
        {
          userType,
          status: nextStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("User status updated");
        // Refetch after a mutation instead of patching local rows by hand,
        // because the backend may also change derived status labels.
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-sm text-gray-500">
            Browse and filter all registered users in one place.
          </p>
        </div>
        <div className="rounded-lg bg-white px-4 py-3 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Total Users
          </p>
          <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 rounded-lg bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        <input
          type="text"
          placeholder="Search name or email..."
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.search}
          onChange={(event) => handleFilterChange("search", event.target.value)}
        />

        <select
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.userType}
          onChange={(event) =>
            handleFilterChange("userType", event.target.value)
          }
        >
          <option value="all">All user types</option>
          <option value="patient">Patient</option>
          <option value="therapist">Therapist</option>
          <option value="admin">Admin</option>
          <option value="super-admin">Super Admin</option>
        </select>

        <select
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.status}
          onChange={(event) => handleFilterChange("status", event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>

        <select
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.sortOrder}
          onChange={(event) =>
            handleFilterChange("sortOrder", event.target.value)
          }
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>

        <select
          className="w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filters.limit}
          onChange={(event) => handleFilterChange("limit", event.target.value)}
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full rounded-lg bg-white shadow-lg">
          <thead className="bg-gray-200 text-left text-sm uppercase leading-normal text-gray-600">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">User Type</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Registered</th>
              <th className="px-6 py-3">Last Login</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm font-light text-gray-600">
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.phoneNumber || "-"}</td>
                <td className="px-6 py-4 capitalize">{user.userType}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      STATUS_STYLES[user.status] || "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString()
                    : "-"}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      to={`/admin/users/${user.id}?userType=${user.userType}`}
                      className="text-blue-500 hover:underline"
                    >
                      View Details
                    </Link>
                    {user.status === "active" ? (
                      <button
                        onClick={() =>
                          handleStatusChange(user.id, user.userType, "inactive")
                        }
                        className="text-red-500 hover:underline"
                      >
                        Deactivate
                      </button>
                    ) : null}
                    {user.status === "inactive" ? (
                      <button
                        onClick={() =>
                          handleStatusChange(user.id, user.userType, "active")
                        }
                        className="text-green-600 hover:underline"
                      >
                        Activate
                      </button>
                    ) : null}
                    {user.userType === "therapist" && user.status === "pending" ? (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(user.id, user.userType, "active")
                          }
                          className="text-green-600 hover:underline"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(user.id, user.userType, "inactive")
                          }
                          className="text-red-500 hover:underline"
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}

            {users.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-center text-gray-500" colSpan={8}>
                  No users found for the current filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {pagination.currentPage} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleFilterChange("page", filters.page - 1)}
            disabled={filters.page <= 1}
            className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handleFilterChange("page", filters.page + 1)}
            disabled={filters.page >= pagination.totalPages}
            className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
