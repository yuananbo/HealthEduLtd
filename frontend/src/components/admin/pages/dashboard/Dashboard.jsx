import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../../../context/UserContext";
import { adminBaseURL } from "../../../../utils/adminApi";

const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  verified: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  inactive: "bg-gray-200 text-gray-700",
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  offline: "bg-red-100 text-red-700",
  faulty: "bg-red-100 text-red-700",
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleDateString();
};

const formatRevenue = (revenueRows) => {
  if (!Array.isArray(revenueRows) || revenueRows.length === 0) {
    return "0";
  }

  return revenueRows
    .map((row) => `${row.currency || "CUR"} ${Number(row.total || 0).toLocaleString()}`)
    .join(" | ");
};

const DEFAULT_DEVICES = [
  {
    id: "DEV-1001",
    type: "Rehab Band Sensor",
    assignedTo: "Unassigned",
    status: "offline",
    lastSeen: "-",
    firmware: "1.0.0",
  },
  {
    id: "DEV-1002",
    type: "Motion Tracker",
    assignedTo: "Unassigned",
    status: "offline",
    lastSeen: "-",
    firmware: "1.0.0",
  },
];

const Dashboard = () => {
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kpis, setKpis] = useState({
    bookings: 0,
    activePatients: 0,
    pendingTherapists: 0,
    revenue: [],
  });
  const [users, setUsers] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [contents, setContents] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [therapistSearch, setTherapistSearch] = useState("");
  const [contentSearch, setContentSearch] = useState("");
  const [deviceSearch, setDeviceSearch] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser?.token) {
        return;
      }

      setLoading(true);
      setError("");
      try {
        const headers = {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        };

        const [summaryRes, usersRes, therapistsRes, contentRes] =
          await Promise.all([
            axios.get(`${adminBaseURL}/dashboard/summary`, { headers }),
            axios.get(`${adminBaseURL}/users`, { headers }),
            axios.get(`${adminBaseURL}/therapists`, { headers }),
            axios.get(`${adminBaseURL}/content`, { headers }),
          ]);

        setKpis(summaryRes?.data?.data || {});
        setUsers(usersRes?.data?.data || []);
        setTherapists(therapistsRes?.data?.data || []);
        setContents(contentRes?.data?.data || []);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser?.token]);

  const filteredUsers = useMemo(() => {
    const keyword = userSearch.toLowerCase();
    return users.filter((item) =>
      `${item.name} ${item.email} ${item.role}`.toLowerCase().includes(keyword)
    );
  }, [userSearch, users]);

  const filteredTherapists = useMemo(() => {
    const keyword = therapistSearch.toLowerCase();
    return therapists.filter((item) =>
      `${item.firstName} ${item.lastName} ${item.email} ${item.specialization}`
        .toLowerCase()
        .includes(keyword)
    );
  }, [therapistSearch, therapists]);

  const filteredContents = useMemo(() => {
    const keyword = contentSearch.toLowerCase();
    return contents.filter((item) =>
      `${item.title} ${item.topic} ${item.type} ${item.sourceName}`
        .toLowerCase()
        .includes(keyword)
    );
  }, [contentSearch, contents]);

  const filteredDevices = useMemo(() => {
    const keyword = deviceSearch.toLowerCase();
    return DEFAULT_DEVICES.filter((item) =>
      `${item.id} ${item.type} ${item.assignedTo} ${item.status}`
        .toLowerCase()
        .includes(keyword)
    );
  }, [deviceSearch]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          KPI (Bookings, Revenue, Active Patients) + Users + Therapists + Content + Device Inventory
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-800">KPIs</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Bookings</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">
              {loading ? "..." : kpis.bookings || 0}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="mt-2 text-xl font-bold text-gray-800">
              {loading ? "..." : formatRevenue(kpis.revenue)}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active Patients (30d)</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">
              {loading ? "..." : kpis.activePatients || 0}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Pending Therapists</p>
            <p className="mt-2 text-3xl font-bold text-gray-800">
              {loading ? "..." : kpis.pendingTherapists || 0}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-800">User Management Table</h2>
          <input
            value={userSearch}
            onChange={(event) => setUserSearch(event.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm md:w-72"
            placeholder="Search users..."
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.slice(0, 10).map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3 capitalize">{item.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        STATUS_STYLES[item.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
              {!loading && filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-800">Therapist Management</h2>
          <input
            value={therapistSearch}
            onChange={(event) => setTherapistSearch(event.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm md:w-72"
            placeholder="Search therapists..."
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Specialization</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredTherapists.slice(0, 10).map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-3">
                    {item.firstName} {item.lastName}
                  </td>
                  <td className="px-4 py-3">{item.email}</td>
                  <td className="px-4 py-3">{item.specialization}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        item.isVerified
                          ? STATUS_STYLES.verified
                          : STATUS_STYLES.pending
                      }`}
                    >
                      {item.isVerified ? "verified" : "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
              {!loading && filteredTherapists.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                    No therapists found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-800">Content Management</h2>
          <input
            value={contentSearch}
            onChange={(event) => setContentSearch(event.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm md:w-72"
            placeholder="Search content..."
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredContents.slice(0, 10).map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-3">{item.title}</td>
                  <td className="px-4 py-3">{item.topic}</td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3">{item.sourceName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        item.isPublished
                          ? STATUS_STYLES.published
                          : STATUS_STYLES.draft
                      }`}
                    >
                      {item.isPublished ? "published" : "draft"}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && filteredContents.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                    No content found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-800">Device Inventory</h2>
          <input
            value={deviceSearch}
            onChange={(event) => setDeviceSearch(event.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm md:w-72"
            placeholder="Search devices..."
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Device ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Assigned To</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Firmware</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{item.id}</td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3">{item.assignedTo}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        STATUS_STYLES[item.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{item.firmware}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
