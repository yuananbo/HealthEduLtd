import { FaRegCommentDots, FaStar } from "react-icons/fa";

const STAR_LEVELS = [5, 4, 3, 2, 1];

const formatReviewDate = (value) => {
  if (!value) return "Date unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Date unavailable";
  return parsed.toLocaleDateString();
};

const getReviewerName = (review) => {
  if (review?.isAnonymous || !review?.patient) {
    return "Anonymous patient";
  }
  const firstName = review.patient.firstName || "";
  const lastName = review.patient.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Anonymous patient";
};

const renderStars = (rating, sizeClass = "w-5 h-5") =>
  [1, 2, 3, 4, 5].map((star) => (
    <svg
      key={star}
      className={`${sizeClass} ${
        star <= Math.round(rating) ? "text-amber-400" : "text-slate-200"
      }`}
      fill="currentColor"
      viewBox="0 0 20 20"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ));

const RatingsTab = ({ therapist, averageRating = 0 }) => {
  const ratings = Array.isArray(therapist?.ratings) ? therapist.ratings : [];
  const safeAverage =
    typeof averageRating === "number"
      ? averageRating
      : ratings.length > 0
      ? ratings.reduce((sum, item) => sum + (item?.rating || 0), 0) /
        ratings.length
      : 0;

  const sortedRatings = [...ratings].sort((a, b) => {
    const aTime = new Date(a?.createdAt || 0).getTime();
    const bTime = new Date(b?.createdAt || 0).getTime();
    return bTime - aTime;
  });

  const distribution = STAR_LEVELS.map((star) => {
    const count = ratings.filter((review) => Number(review?.rating) === star).length;
    const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
    return { star, count, percentage };
  });

  if (ratings.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
          <FaRegCommentDots className="text-2xl text-slate-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Patient Feedback</h3>
        <p className="mt-2 text-slate-500">
          No patient reviews yet. Ratings will appear here once patients submit
          feedback after their appointments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 p-6 text-white shadow-lg xl:w-[320px]">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-100">
            Patient Feedback
          </p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-6xl font-bold leading-none">
              {safeAverage.toFixed(1)}
            </span>
            <span className="pb-2 text-sky-100">/ 5</span>
          </div>
          <div className="mt-4 flex items-center gap-1">
            {renderStars(safeAverage, "h-6 w-6")}
          </div>
          <p className="mt-4 text-sm text-sky-100">
            Based on {ratings.length} patient review{ratings.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-slate-800">
            Rating Distribution
          </h4>
          <div className="mt-5 space-y-3">
            {distribution.map((item) => (
              <div key={item.star} className="flex items-center gap-3">
                <div className="flex w-16 items-center gap-1 text-sm font-medium text-slate-700">
                  <span>{item.star}</span>
                  <FaStar className="text-amber-400" />
                </div>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="w-12 text-right text-sm text-slate-500">
                  {item.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-xl font-semibold text-slate-800">Recent Reviews</h4>
          <p className="text-sm text-slate-500">
            Newest feedback appears first.
          </p>
        </div>

        {sortedRatings.map((review, index) => (
          <div
            key={review?._id || `review-${index}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  {getReviewerName(review)}
                </p>
                <p className="text-sm text-slate-500">
                  {review?.isAnonymous || !review?.patient
                    ? "Anonymous submission — name hidden"
                    : review.patient.patientId
                    ? `Patient ID: ${review.patient.patientId}`
                    : "Patient ID unavailable"}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="flex items-center gap-1 sm:justify-end">
                  {renderStars(review?.rating || 0, "h-5 w-5")}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {formatReviewDate(review?.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-slate-700">
              {(review?.review || "").trim()
                ? review.review
                : "No written comment provided."}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingsTab;
