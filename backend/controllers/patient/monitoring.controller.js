import { asyncHandler } from "../../middleware/asyncHandler.js";
import DailyCheckIn from "../../models/dailyCheckIn.model.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const upsertDailyCheckIn = asyncHandler(async (req, res) => {
  const patientId = req.user._id;
  const {
    date,
    painLevel,
    mood,
    exerciseCompleted,
    adlIndependence,
    weightKg,
    bloodPressure,
    heartRateBpm,
    bloodSugar,
    notes,
  } = req.body || {};

  if (!date || typeof date !== "string" || !DATE_RE.test(date)) {
    return res.status(400).json({
      message: "date is required in YYYY-MM-DD format",
    });
  }

  const payload = {
    patient: patientId,
    date,
  };

  if (painLevel !== undefined) payload.painLevel = painLevel;
  if (mood !== undefined) payload.mood = mood;
  if (exerciseCompleted !== undefined)
    payload.exerciseCompleted = Boolean(exerciseCompleted);
  if (adlIndependence !== undefined) payload.adlIndependence = adlIndependence;
  if (weightKg !== undefined) payload.weightKg = weightKg;
  if (bloodPressure !== undefined) payload.bloodPressure = bloodPressure;
  if (heartRateBpm !== undefined) payload.heartRateBpm = heartRateBpm;
  if (bloodSugar !== undefined) payload.bloodSugar = bloodSugar;
  if (notes !== undefined) payload.notes = notes;

  const checkIn = await DailyCheckIn.findOneAndUpdate(
    { patient: patientId, date },
    { $set: payload },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({ success: true, data: checkIn });
});

export const getMyDailyCheckIns = asyncHandler(async (req, res) => {
  const patientId = req.user._id;
  const limit = Math.min(Number(req.query.limit) || 14, 100);

  const checkIns = await DailyCheckIn.find({ patient: patientId })
    .sort({ date: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    count: checkIns.length,
    data: checkIns,
  });
});

export const getMyLatestDailyCheckIn = asyncHandler(async (req, res) => {
  const patientId = req.user._id;
  const checkIn = await DailyCheckIn.findOne({ patient: patientId }).sort({
    date: -1,
  });

  res.status(200).json({
    success: true,
    data: checkIn,
  });
});

