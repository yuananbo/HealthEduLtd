import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../../../context/UserContext";
import { adminBaseURL } from "../../../../utils/adminApi";

const DASHBOARD_STATE_KEY = "admin-dashboard-panel-state";

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

const PAGE_SIZE_OPTIONS = [5, 10, 20];

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

const getPageSlice = (rows, currentPage, pageSize) => {
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    rows: rows.slice(start, start + pageSize),
    currentPage: safePage,
    totalPages,
    totalItems,
  };
};

const createSearchStrategy = (valueBuilder) => (rows, keyword) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) {
    return rows;
  }

  return rows.filter((row) =>
    valueBuilder(row).toLowerCase().includes(normalizedKeyword)
  );
};

const summaryStrategies = {
  users: (rows) => `${rows.length} users`,
  therapists: (rows) => `${rows.length} therapists`,
  contents: (rows) => `${rows.length} content items`,
  devices: (rows) => `${rows.length} devices`,
};

const searchStrategies = {
  users: createSearchStrategy(
    (item) => `${item.name} ${item.email} ${item.role || ""}`
  ),
  therapists: createSearchStrategy(
    (item) =>
      `${item.firstName} ${item.lastName} ${item.email} ${item.specialization}`
  ),
  contents: createSearchStrategy(
    (item) => `${item.title} ${item.topic} ${item.type} ${item.sourceName}`
  ),
  devices: createSearchStrategy(
    (item) => `${item.id} ${item.type} ${item.assignedTo} ${item.status}`
  ),
};

const columnStrategies = {
  users: [
    { key: "name", label: "Name", render: (item) => item.name },
    { key: "email", label: "Email", render: (item) => item.email },
    {
      key: "role",
      label: "Role",
      render: (item) => <span className="capitalize">{item.role}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            STATUS_STYLES[item.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (item) => formatDate(item.createdAt),
    },
  ],
  therapists: [
    {
      key: "name",
      label: "Name",
      render: (item) => `${item.firstName} ${item.lastName}`,
    },
    { key: "email", label: "Email", render: (item) => item.email },
    {
      key: "specialization",
      label: "Specialization",
      render: (item) => item.specialization,
    },
    {
      key: "verification",
      label: "Verification",
      render: (item) => (
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            item.isVerified ? STATUS_STYLES.verified : STATUS_STYLES.pending
          }`}
        >
          {item.isVerified ? "verified" : "pending"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (item) => formatDate(item.createdAt),
    },
  ],
  contents: [
    { key: "title", label: "Title", render: (item) => item.title },
    { key: "topic", label: "Topic", render: (item) => item.topic },
    { key: "type", label: "Type", render: (item) => item.type },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            item.isPublished ? STATUS_STYLES.published : STATUS_STYLES.draft
          }`}
        >
          {item.isPublished ? "published" : "draft"}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (item) => formatDate(item.updatedAt),
    },
  ],
  devices: [
    { key: "id", label: "Device ID", render: (item) => item.id },
    { key: "type", label: "Type", render: (item) => item.type },
    {
      key: "assignedTo",
      label: "Assigned To",
      render: (item) => item.assignedTo,
    },
    {
      key: "status",
      label: "Status",
      render: (item) => (
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            STATUS_STYLES[item.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    { key: "lastSeen", label: "Last Seen", render: (item) => item.lastSeen },
    { key: "firmware", label: "Firmware", render: (item) => item.firmware },
  ],
};

const dashboardTableConfigs = [
  {
    key: "users",
    title: "User Management Table",
    subtitle: "Browse recent users directly from the dashboard.",
    searchPlaceholder: "Search users...",
    emptyMessage: "No users found.",
    getRowKey: (item) => item.id,
  },
  {
    key: "therapists",
    title: "Therapist Management",
    subtitle: "Quick therapist verification view from the dashboard.",
    searchPlaceholder: "Search therapists...",
    emptyMessage: "No therapists found.",
    getRowKey: (item) => item._id,
  },
  {
    key: "contents",
    title: "Content Library",
    subtitle: "Quick view into education content from the dashboard.",
    searchPlaceholder: "Search content...",
    emptyMessage: "No content found.",
    getRowKey: (item) => item._id,
  },
  {
    key: "devices",
    title: "Device Inventory",
    subtitle: "Operational device summary kept on the dashboard.",
    searchPlaceholder: "Search devices...",
    emptyMessage: "No devices found.",
    getRowKey: (item) => item.id,
  },
];

const createDefaultDashboardState = () => ({
  searchValues: {
    users: "",
    therapists: "",
    contents: "",
    devices: "",
  },
  collapsedSections: {
    users: false,
    therapists: false,
    contents: false,
    devices: false,
  },
  pagination: {
    users: { page: 1, pageSize: 5 },
    therapists: { page: 1, pageSize: 5 },
    contents: { page: 1, pageSize: 5 },
    devices: { page: 1, pageSize: 5 },
  },
});

const readPersistedDashboardState = () => {
  if (typeof window === "undefined") {
    return createDefaultDashboardState();
  }

  try {
    const raw = window.localStorage.getItem(DASHBOARD_STATE_KEY);
    if (!raw) {
      return createDefaultDashboardState();
    }

    const parsed = JSON.parse(raw);
    const defaults = createDefaultDashboardState();

    return {
      searchValues: {
        ...defaults.searchValues,
        ...(parsed.searchValues || {}),
      },
      collapsedSections: {
        ...defaults.collapsedSections,
        ...(parsed.collapsedSections || {}),
      },
      pagination: {
        users: {
          ...defaults.pagination.users,
          ...(parsed.pagination?.users || {}),
        },
        therapists: {
          ...defaults.pagination.therapists,
          ...(parsed.pagination?.therapists || {}),
        },
        contents: {
          ...defaults.pagination.contents,
          ...(parsed.pagination?.contents || {}),
        },
        devices: {
          ...defaults.pagination.devices,
          ...(parsed.pagination?.devices || {}),
        },
      },
    };
  } catch {
    return createDefaultDashboardState();
  }
};

const SectionCard = ({
  title,
  subtitle,
  summary,
  collapsed,
  onToggle,
  children,
}) => (
  <section className="rounded-xl border bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        {summary ? <p className="text-sm text-gray-500">{summary}</p> : null}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg border px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>
    </div>

    {!collapsed ? <div className="mt-5">{children}</div> : null}
  </section>
);

const TablePagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => (
  <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <p className="text-sm text-gray-500">
      Page {currentPage} of {totalPages} | {totalItems} items
    </p>
    <div className="flex items-center gap-2">
      <select
        value={pageSize}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        {PAGE_SIZE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option} per page
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Previous
      </button>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="rounded-lg border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
);

const DashboardTableCard = ({
  config,
  rows,
  searchValue,
  onSearchChange,
  page,
  pageSize,
  collapsed,
  onToggle,
  onPageChange,
  onPageSizeChange,
  loading,
}) => {
  const columns = columnStrategies[config.key];
  const summary = summaryStrategies[config.key](rows);
  const paginated = getPageSlice(rows, page, pageSize);

  return (
    <SectionCard
      title={config.title}
      subtitle={config.subtitle}
      summary={summary}
      collapsed={collapsed}
      onToggle={onToggle}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm md:w-72"
          placeholder={config.searchPlaceholder}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.rows.map((item) => (
              <tr key={config.getRowKey(item)} className="border-t">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
            {!loading && paginated.rows.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-gray-500"
                  colSpan={columns.length}
                >
                  {config.emptyMessage}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <TablePagination
        currentPage={paginated.currentPage}
        totalPages={paginated.totalPages}
        totalItems={paginated.totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </SectionCard>
  );
};

const Dashboard = () => {
  const { currentUser } = useContext(UserContext);
  const persistedState = useMemo(() => readPersistedDashboardState(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [kpis, setKpis] = useState({
    bookings: 0,
    activePatients: 0,
    pendingTherapists: 0,
    revenue: [],
  });
  const [datasets, setDatasets] = useState({
    users: [],
    therapists: [],
    contents: [],
    devices: DEFAULT_DEVICES,
  });
  const [searchValues, setSearchValues] = useState(persistedState.searchValues);
  const [collapsedSections, setCollapsedSections] = useState(
    persistedState.collapsedSections
  );
  const [pagination, setPagination] = useState(persistedState.pagination);

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
            axios.get(`${adminBaseURL}/users`, {
              headers,
              params: { limit: 100, page: 1 },
            }),
            axios.get(`${adminBaseURL}/therapists`, { headers }),
            axios.get(`${adminBaseURL}/content`, {
              headers,
              params: { limit: 100, page: 1 },
            }),
          ]);

        setKpis(summaryRes?.data?.data || {});
        setDatasets({
          users: usersRes?.data?.data || [],
          therapists: therapistsRes?.data?.data || [],
          contents: contentRes?.data?.data || [],
          devices: DEFAULT_DEVICES,
        });
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || fetchError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser?.token]);

  const filteredRows = useMemo(() => {
    const nextRows = {};

    for (const config of dashboardTableConfigs) {
      nextRows[config.key] = searchStrategies[config.key](
        datasets[config.key],
        searchValues[config.key]
      );
    }

    return nextRows;
  }, [datasets, searchValues]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      DASHBOARD_STATE_KEY,
      JSON.stringify({
        searchValues,
        collapsedSections,
        pagination,
      })
    );
  }, [searchValues, collapsedSections, pagination]);

  const handleSearchChange = (sectionKey, value) => {
    setSearchValues((previous) => ({
      ...previous,
      [sectionKey]: value,
    }));

    setPagination((previous) => ({
      ...previous,
      [sectionKey]: {
        ...previous[sectionKey],
        page: 1,
      },
    }));
  };

  const handleToggle = (sectionKey) => {
    setCollapsedSections((previous) => ({
      ...previous,
      [sectionKey]: !previous[sectionKey],
    }));
  };

  const handlePageChange = (sectionKey, page) => {
    setPagination((previous) => ({
      ...previous,
      [sectionKey]: {
        ...previous[sectionKey],
        page,
      },
    }));
  };

  const handlePageSizeChange = (sectionKey, pageSize) => {
    setPagination((previous) => ({
      ...previous,
      [sectionKey]: {
        page: 1,
        pageSize,
      },
    }));
  };

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

      {dashboardTableConfigs.map((config) => (
        <DashboardTableCard
          key={config.key}
          config={config}
          rows={filteredRows[config.key]}
          searchValue={searchValues[config.key]}
          onSearchChange={(value) => handleSearchChange(config.key, value)}
          page={pagination[config.key].page}
          pageSize={pagination[config.key].pageSize}
          collapsed={collapsedSections[config.key]}
          onToggle={() => handleToggle(config.key)}
          onPageChange={(page) => handlePageChange(config.key, page)}
          onPageSizeChange={(pageSize) =>
            handlePageSizeChange(config.key, pageSize)
          }
          loading={loading}
        />
      ))}
    </div>
  );
};

export default Dashboard;
