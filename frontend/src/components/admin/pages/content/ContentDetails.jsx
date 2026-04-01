import axios from "axios";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";
import { adminBaseURL } from "../../../../utils/adminApi";
import ContentForm, { validateContentForm } from "./ContentForm";

const Row = ({ label, value }) => (
  <div className="border-b border-gray-100 py-3">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-800">{value || "-"}</p>
  </div>
);

const ContentDetails = () => {
  const { id } = useParams();
  const { currentUser } = useContext(UserContext);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editing, setEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContent = async () => {
      if (!currentUser?.token || !id) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await axios.get(`${adminBaseURL}/content/${id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
        });

        setContent(response?.data?.data || null);
        setFormValues(response?.data?.data || null);
      } catch (fetchError) {
        setError(
          fetchError?.response?.data?.message ||
            "Failed to load content details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [currentUser?.token, id]);

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError("");
    setFormValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleStatusToggle = async () => {
    if (!content || !currentUser?.token) {
      return;
    }

    setUpdatingStatus(true);

    try {
      const nextPublishedState = !content.isPublished;
      const response = await axios.patch(
        `${adminBaseURL}/content/${id}/status`,
        {
          isPublished: nextPublishedState,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setContent(response?.data?.data || content);
      setFormValues(response?.data?.data || content);
      toast.success(
        nextPublishedState ? "Content published" : "Content unpublished"
      );
    } catch (updateError) {
      toast.error(
        updateError?.response?.data?.message || "Failed to update content status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!formValues || !currentUser?.token) {
      return;
    }

    const nextErrors = validateContentForm(formValues);
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      setFormError("Please fix the highlighted fields before saving.");
      return;
    }

    setSavingEdit(true);
    setFormError("");

    try {
      const response = await axios.patch(
        `${adminBaseURL}/content/${id}`,
        formValues,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setContent(response?.data?.data || formValues);
      setFormValues(response?.data?.data || formValues);
      setEditing(false);
      setFormErrors({});
      toast.success("Content updated");
    } catch (updateError) {
      const message =
        updateError?.response?.data?.message || "Failed to update content";
      setFormError(message);
      toast.error(message);
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse rounded-xl border bg-white p-6 shadow-sm">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="mt-4 h-8 w-64 rounded bg-gray-200" />
          <div className="mt-3 h-4 w-full rounded bg-gray-100" />
          <div className="mt-2 h-4 w-3/4 rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (!content) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-gray-600">No content details found.</p>
      </div>
    );
  }

  if (editing && formValues) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link to="/admin/content" className="text-sm text-blue-600 hover:underline">
              Back to Content
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-800">Edit Content</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setFormValues(content);
              setFormErrors({});
              setFormError("");
            }}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <ContentForm
            values={formValues}
            onChange={handleFormChange}
            onSubmit={handleEditSubmit}
            submitLabel="Save Changes"
            submitting={savingEdit}
            errors={formErrors}
            formError={formError}
          />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/admin/content" className="text-sm text-blue-600 hover:underline">
            Back to Content
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-800">{content.title}</h1>
          <p className="mt-2 text-sm text-gray-500">{content.summary}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Edit
          </button>
          <span
            className={`rounded-full px-3 py-1 text-xs ${
              content.isPublished
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {content.isPublished ? "published" : "draft"}
          </span>
          <button
            type="button"
            onClick={handleStatusToggle}
            disabled={updatingStatus}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              content.isPublished
                ? "bg-gray-700 hover:bg-gray-800"
                : "bg-green-600 hover:bg-green-700"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {updatingStatus
              ? "Saving..."
              : content.isPublished
                ? "Unpublish"
                : "Publish"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Overview</h2>
          <Row label="Topic" value={content.topic?.replace(/-/g, " ")} />
          <Row label="Type" value={content.type} />
          <Row label="Duration" value={content.duration} />
          <Row label="Order" value={String(content.order)} />
          <Row label="Source Name" value={content.sourceName} />
          <Row label="Source URL" value={content.sourceUrl} />
          <Row
            label="Updated"
            value={new Date(content.updatedAt).toLocaleString()}
          />
          <Row
            label="Created"
            value={new Date(content.createdAt).toLocaleString()}
          />
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Content Body</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
              Editable in this view
            </span>
          </div>
          <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">
            {content.body}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContentDetails;
