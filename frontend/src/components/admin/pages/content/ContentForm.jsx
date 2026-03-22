const TOPIC_OPTIONS = [
  { value: "nutrition", label: "Nutrition" },
  { value: "ncd-management", label: "NCD Management" },
  { value: "exercises", label: "Exercises" },
  { value: "disability-prevention", label: "Disability Prevention" },
];

const TYPE_OPTIONS = [
  { value: "article", label: "Article" },
  { value: "video", label: "Video" },
];

const ContentForm = ({
  values,
  onChange,
  onSubmit,
  submitLabel,
  submitting,
  errors = {},
  formError = "",
}) => {
  const inputClassName = (fieldName) =>
    `w-full rounded-lg border px-4 py-2 text-sm ${
      errors[fieldName] ? "border-red-300 bg-red-50" : ""
    }`;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {formError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Title
          </span>
          <input
            type="text"
            name="title"
            value={values.title}
            onChange={onChange}
            className={inputClassName("title")}
            required
          />
          {errors.title ? (
            <p className="mt-2 text-xs text-red-600">{errors.title}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Duration
          </span>
          <input
            type="text"
            name="duration"
            value={values.duration}
            onChange={onChange}
            placeholder="e.g. 6 min read"
            className={inputClassName("duration")}
            required
          />
          {errors.duration ? (
            <p className="mt-2 text-xs text-red-600">{errors.duration}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Topic
          </span>
          <select
            name="topic"
            value={values.topic}
            onChange={onChange}
            className={inputClassName("topic")}
            required
          >
            {TOPIC_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.topic ? (
            <p className="mt-2 text-xs text-red-600">{errors.topic}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Type
          </span>
          <select
            name="type"
            value={values.type}
            onChange={onChange}
            className={inputClassName("type")}
            required
          >
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.type ? (
            <p className="mt-2 text-xs text-red-600">{errors.type}</p>
          ) : null}
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Summary
          </span>
          <textarea
            name="summary"
            value={values.summary}
            onChange={onChange}
            rows={3}
            className={inputClassName("summary")}
            required
          />
          {errors.summary ? (
            <p className="mt-2 text-xs text-red-600">{errors.summary}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Source Name
          </span>
          <input
            type="text"
            name="sourceName"
            value={values.sourceName}
            onChange={onChange}
            className={inputClassName("sourceName")}
            required
          />
          {errors.sourceName ? (
            <p className="mt-2 text-xs text-red-600">{errors.sourceName}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Source URL
          </span>
          <input
            type="url"
            name="sourceUrl"
            value={values.sourceUrl}
            onChange={onChange}
            className={inputClassName("sourceUrl")}
            required
          />
          {errors.sourceUrl ? (
            <p className="mt-2 text-xs text-red-600">{errors.sourceUrl}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">
            Display Order
          </span>
          <input
            type="number"
            name="order"
            value={values.order}
            onChange={onChange}
            className={inputClassName("order")}
          />
          {errors.order ? (
            <p className="mt-2 text-xs text-red-600">{errors.order}</p>
          ) : null}
        </label>

        <label className="flex items-center gap-3 pt-8">
          <input
            type="checkbox"
            name="isPublished"
            checked={values.isPublished}
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Published</span>
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-gray-700">
          Content Body
        </span>
        <textarea
          name="body"
          value={values.body}
          onChange={onChange}
          rows={12}
          className={inputClassName("body")}
          required
        />
        {errors.body ? (
          <p className="mt-2 text-xs text-red-600">{errors.body}</p>
        ) : null}
      </label>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

export const createEmptyContentForm = () => ({
  topic: "nutrition",
  type: "article",
  title: "",
  summary: "",
  duration: "",
  body: "",
  sourceName: "",
  sourceUrl: "",
  isPublished: false,
  order: 0,
});

export const validateContentForm = (values) => {
  const nextErrors = {};

  if (!values.title?.trim()) nextErrors.title = "Title is required.";
  if (!values.duration?.trim()) nextErrors.duration = "Duration is required.";
  if (!values.topic?.trim()) nextErrors.topic = "Topic is required.";
  if (!values.type?.trim()) nextErrors.type = "Type is required.";
  if (!values.summary?.trim()) nextErrors.summary = "Summary is required.";
  if (!values.sourceName?.trim())
    nextErrors.sourceName = "Source name is required.";
  if (!values.sourceUrl?.trim()) {
    nextErrors.sourceUrl = "Source URL is required.";
  } else {
    try {
      new URL(values.sourceUrl);
    } catch {
      nextErrors.sourceUrl = "Source URL must be a valid URL.";
    }
  }
  if (!values.body?.trim()) nextErrors.body = "Content body is required.";
  if (values.order !== "" && Number.isNaN(Number(values.order))) {
    nextErrors.order = "Display order must be a number.";
  }

  return nextErrors;
};

export default ContentForm;
