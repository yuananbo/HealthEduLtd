import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../../../utils/api";
import useDataFetching from "../../../../hooks/useFech";
import Button from "../../../common/Button";

const todayLocal = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const DailyCheckIn = ({ darkMode }) => {
  const [form, setForm] = useState({
    date: todayLocal(),
    painLevel: 0,
    mood: "Okay",
    exerciseCompleted: false,
    adlIndependence: "Independent",
    weightKg: "",
    systolic: "",
    diastolic: "",
    heartRateBpm: "",
    bloodSugarValue: "",
    bloodSugarUnit: "mmol/L",
    notes: "",
  });

  const [loadingList, listError, listData, refetchList] = useDataFetching(
    "/patient/monitoring/checkins?limit=14"
  );
  const [saving, setSaving] = useState(false);

  const recent = useMemo(() => {
    return Array.isArray(listData?.data) ? listData.data : [];
  }, [listData]);

  useEffect(() => {
    if (listError) {
      // keep UI usable
      console.error(listError);
    }
  }, [listError]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const payload = {
        date: form.date,
        painLevel: Number(form.painLevel),
        mood: form.mood,
        exerciseCompleted: Boolean(form.exerciseCompleted),
        adlIndependence: form.adlIndependence,
        weightKg: form.weightKg === "" ? null : Number(form.weightKg),
        bloodPressure: {
          systolic: form.systolic === "" ? null : Number(form.systolic),
          diastolic: form.diastolic === "" ? null : Number(form.diastolic),
        },
        heartRateBpm: form.heartRateBpm === "" ? null : Number(form.heartRateBpm),
        bloodSugar: {
          value:
            form.bloodSugarValue === "" ? null : Number(form.bloodSugarValue),
          unit: form.bloodSugarUnit,
        },
        notes: form.notes,
      };

      await api.post("/patient/monitoring/checkins", payload);
      toast.success("Daily check-in saved");
      refetchList();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to save check-in"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Daily Check-in</h1>
          <p className="text-gray-600 mt-1">
            Track daily wellbeing to support independence at home.
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6 mb-8`}
      >
        <h2 className="text-xl font-semibold mb-4">Today&apos;s entry</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mood
              </label>
              <select
                value={form.mood}
                onChange={(e) => update("mood", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {["Very bad", "Bad", "Okay", "Good", "Great"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pain level: {form.painLevel}/10
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={form.painLevel}
                onChange={(e) => update("painLevel", e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ADL independence
              </label>
              <select
                value={form.adlIndependence}
                onChange={(e) => update("adlIndependence", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {[
                  "Independent",
                  "Needs some help",
                  "Needs full assistance",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={form.weightKg}
                onChange={(e) => update("weightKg", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="e.g. 65"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood pressure (systolic)
              </label>
              <input
                type="number"
                value={form.systolic}
                onChange={(e) => update("systolic", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="e.g. 120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood pressure (diastolic)
              </label>
              <input
                type="number"
                value={form.diastolic}
                onChange={(e) => update("diastolic", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="e.g. 80"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Heart rate (bpm)
              </label>
              <input
                type="number"
                value={form.heartRateBpm}
                onChange={(e) => update("heartRateBpm", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="e.g. 72"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood sugar
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.bloodSugarValue}
                  onChange={(e) => update("bloodSugarValue", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 sm:col-span-2"
                  placeholder="e.g. 5.6"
                />
                <select
                  value={form.bloodSugarUnit}
                  onChange={(e) => update("bloodSugarUnit", e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="mmol/L">mmol/L</option>
                  <option value="mg/dL">mg/dL</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="exerciseCompleted"
              type="checkbox"
              checked={form.exerciseCompleted}
              onChange={(e) => update("exerciseCompleted", e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="exerciseCompleted" className="text-sm text-gray-700">
              Exercise completed today
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              rows={4}
              placeholder="Anything you want your care team to know..."
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              label={saving ? "Saving..." : "Save check-in"}
              variant="filled"
              disabled={saving}
            />
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-md p-6`}
      >
        <h2 className="text-xl font-semibold mb-4">Recent check-ins</h2>
        {loadingList ? (
          <p>Loading...</p>
        ) : listError ? (
          <p className="text-red-500">Failed to load check-ins</p>
        ) : recent.length === 0 ? (
          <p className="text-gray-500">No check-ins yet</p>
        ) : (
          <div className="space-y-3">
            {recent.map((c) => (
              <div
                key={c._id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="font-semibold text-gray-800">{c.date}</div>
                  <div className="text-sm text-gray-600">
                    Mood: {c.mood} • Pain: {c.painLevel ?? "-"}
                    {typeof c?.bloodPressure?.systolic === "number" &&
                    typeof c?.bloodPressure?.diastolic === "number"
                      ? ` • BP: ${c.bloodPressure.systolic}/${c.bloodPressure.diastolic}`
                      : ""}
                    {typeof c?.heartRateBpm === "number"
                      ? ` • HR: ${c.heartRateBpm}`
                      : ""}
                    {typeof c?.bloodSugar?.value === "number"
                      ? ` • Sugar: ${c.bloodSugar.value} ${c.bloodSugar.unit}`
                      : ""}
                    {typeof c?.weightKg === "number" ? ` • ${c.weightKg}kg` : ""}
                  </div>
                </div>
                {(c.notes || "").trim() && (
                  <div className="text-sm text-gray-600 mt-2">{c.notes}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DailyCheckIn;

