import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";
import { adminBaseURL } from "../../../../utils/adminApi";

const STATUS_STYLES = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
};

const TOPIC_OPTIONS = [
  { value: "all", label: "All topics" },
  { value: "nutrition", label: "Nutrition" },
  { value: "ncd-management", label: "NCD Management" },
  { value: "exercises", label: "Exercises" },
  { value: "disability-prevention", label: "Disability Prevention" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "article", label: "Article" },
  { value: "video", label: "Video" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const LoadingRows = () =>
  Array.from({ length: 5 }).map((_, index) => (
    <tr key={`loading-${index}`} className="border-t animate-pulse">
      <td className="px-4 py-4">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-64 rounded bg-gray-100" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-24 rounded bg-gray-100" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-16 rounded bg-gray-100" />
      </td>
      <td className="px-4 py-4">
        <div className="h-6 w-20 rounded-full bg-gray-100" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-28 rounded bg-gray-100" />
      </td>
      <td className="px-4 py-4">
        <div className="h-4 w-20 rounded bg-gray-100" />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="ml-auto h-4 w-20 rounded bg-gray-100" />
      </td>
    </tr>
  ));

const ContentList = () => {
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contents, setContents] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    search: "",
    topic: "all",
    type: "all",
    status: "all",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    const fetchContents = async () => {
      if (!currentUser?.token) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${adminBaseURL}/content`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
          params: filters,
        });

        setContents(response?.data?.data || []);
        setPagination({
          total: response?.data?.total || 0,
          currentPage: response?.data?.currentPage || 1,
          totalPages: response?.data?.totalPages || 1,
        });
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message ||
            "Failed to load content. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [currentUser?.token, filters]);

  const summary = useMemo(() => {
    const published = contents.filter((item) => item.isPublished).length;
    return {
      total: contents.length,
      published,
      draft: contents.length - published,
    };
  }, [contents]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Content Management
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Review all education content and narrow the list by topic, type,
              or publishing status.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Total
              </p>
              <p className="mt-2 text-2xl font-semibold text-gray-800">
                {summary.total}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Published
              </p>
              <p className="mt-2 text-2xl font-semibold text-green-700">
                {summary.published}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Draft
              </p>
              <p className="mt-2 text-2xl font-semibold text-yellow-700">
                {summary.draft}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Search
            </span>
            <input
              type="text"
              value={filters.search}
              onChange={(event) =>
                handleFilterChange("search", event.target.value)
              }
              placeholder="Search title, summary, source..."
              className="w-full rounded-lg border px-4 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Topic
            </span>
            <select
              value={filters.topic}
              onChange={(event) =>
                handleFilterChange("topic", event.target.value)
              }
              className="w-full rounded-lg border px-4 py-2 text-sm"
            >
              {TOPIC_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Type
            </span>
            <select
              value={filters.type}
              onChange={(event) =>
                handleFilterChange("type", event.target.value)
              }
              className="w-full rounded-lg border px-4 py-2 text-sm"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </span>
            <select
              value={filters.status}
              onChange={(event) =>
                handleFilterChange("status", event.target.value)
              }
              className="w-full rounded-lg border px-4 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Education Content
            </h2>
            <p className="text-sm text-gray-500">
              {loading
                ? "Refreshing content..."
                : `${contents.length} items on this page`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filters.limit}
              onChange={(event) =>
                handleFilterChange("limit", Number(event.target.value))
              }
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <Link
              to="/admin/content/new"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              New Content
            </Link>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRows /> : null}

              {!loading
                ? contents.map((item) => {
                const statusLabel = item.isPublished ? "published" : "draft";

                return (
                  <tr key={item._id} className="border-t">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <p className="mt-1 max-w-md text-xs text-gray-500">
                        {item.summary}
                      </p>
                    </td>
                    <td className="px-4 py-4 capitalize">
                      {item.topic?.replace(/-/g, " ")}
                    </td>
                    <td className="px-4 py-4 capitalize">{item.type}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${STATUS_STYLES[statusLabel]}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-4">{item.sourceName}</td>
                    <td className="px-4 py-4">{formatDate(item.updatedAt)}</td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/admin/content/${item._id}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                );
              })
                : null}

              {!loading && contents.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={7}>
                    <div>
                      <p className="font-medium text-gray-700">
                        No content matched the current filters.
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Try changing the search term or resetting topic, type,
                        and status filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t pt-4 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
          <p>
            Showing page {pagination.currentPage} of {pagination.totalPages} with{" "}
            {pagination.total} total items
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleFilterChange("page", Math.max(1, pagination.currentPage - 1))
              }
              disabled={pagination.currentPage <= 1}
              className="rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                handleFilterChange(
                  "page",
                  Math.min(pagination.totalPages, pagination.currentPage + 1)
                )
              }
              disabled={pagination.currentPage >= pagination.totalPages}
              className="rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContentList;
