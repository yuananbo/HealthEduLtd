import axios from "axios";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";
import { adminBaseURL } from "../../../../utils/adminApi";
import ContentForm, {
  createEmptyContentForm,
  validateContentForm,
} from "./ContentForm";

const CreateContent = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(UserContext);
  const [values, setValues] = useState(createEmptyContentForm());
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError("");
    setValues((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!currentUser?.token) {
      return;
    }

    const nextErrors = validateContentForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError("Please fix the highlighted fields before submitting.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      const response = await axios.post(`${adminBaseURL}/content`, values, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Content created");
      navigate(`/admin/content/${response?.data?.data?._id}`, { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to create content";
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/content" className="text-sm text-blue-600 hover:underline">
          Back to Content
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-800">New Content</h1>
        <p className="mt-2 text-sm text-gray-500">
          Create a new education content item for patient review.
        </p>
      </div>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <ContentForm
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Create Content"
          submitting={submitting}
          errors={errors}
          formError={formError}
        />
      </section>
    </div>
  );
};

export default CreateContent;
