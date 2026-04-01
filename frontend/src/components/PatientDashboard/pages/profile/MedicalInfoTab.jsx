import React, { useState } from "react";
import {
  FaNotesMedical,
  FaWeight,
  FaPills,
  FaUpload,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import Input from "../../../common/forms/Input";
import Button from "../../../common/Button";
import FileUpload from "../../../common/forms/FileUpload";
import api from "../../../../utils/api";
import { formatDate } from "../../../../utils/dateFormater";
import toast from "react-hot-toast";

const MedicalInfoTab = ({ patient, setPatient, reloadPatient }) => {
  const [onUpdate, setOnUpdate] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState(null);

  const prescriptions = Array.isArray(patient?.prescriptions)
    ? patient.prescriptions
    : [];

  const deletePrescription = async (prescriptionId) => {
    try {
      setOnUpdate(true);
      await api.delete(`/patient/profile/prescriptions/${prescriptionId}`);
      toast.success("Prescription deleted");
      await reloadPatient?.();
    } catch (error) {
      console.error("Error deleting prescription:", error);
      toast.error(
        error.response?.data?.message || "Error deleting prescription"
      );
    } finally {
      setOnUpdate(false);
    }
  };

  const handleVitalChange = (index, field, value) => {
    const updatedVitals = Array.isArray(patient?.vitals)
      ? [...patient.vitals]
      : [];
    if (!updatedVitals[index])
      updatedVitals[index] = { type: "", value: "", unit: "" };
    updatedVitals[index][field] = value;
    setPatient({ ...patient, vitals: updatedVitals });
  };

  const addVital = () => {
    setPatient({
      ...patient,
      vitals: [
        ...(Array.isArray(patient?.vitals) ? patient.vitals : []),
        { type: "", value: "", unit: "" },
      ],
    });
  };

  const removeVital = (index) => {
    const updatedVitals = (Array.isArray(patient?.vitals) ? patient.vitals : [])
      .filter((_, i) => i !== index);
    setPatient({ ...patient, vitals: updatedVitals });
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = Array.isArray(patient?.medications)
      ? [...patient.medications]
      : [];
    if (!updatedMedications[index])
      updatedMedications[index] = { name: "", dosage: "", frequency: "" };
    updatedMedications[index][field] = value;
    setPatient({ ...patient, medications: updatedMedications });
  };

  const addMedication = () => {
    setPatient({
      ...patient,
      medications: [
        ...(Array.isArray(patient?.medications) ? patient.medications : []),
        { name: "", dosage: "", frequency: "" },
      ],
    });
  };

  const removeMedication = (index) => {
    const updatedMedications = (Array.isArray(patient?.medications)
      ? patient.medications
      : []
    ).filter((_, i) => i !== index);
    setPatient({ ...patient, medications: updatedMedications });
  };

  const handleMedicalHistoryChange = (index, field, value) => {
    const updated = Array.isArray(patient?.medicalHistory)
      ? [...patient.medicalHistory]
      : [];
    if (!updated[index]) updated[index] = { condition: "", diagnosedDate: "" };
    updated[index] = { ...updated[index], [field]: value };
    setPatient({ ...patient, medicalHistory: updated });
  };

  const addMedicalHistoryItem = () => {
    setPatient({
      ...patient,
      medicalHistory: [
        ...(Array.isArray(patient?.medicalHistory)
          ? patient.medicalHistory
          : []),
        { condition: "", diagnosedDate: "" },
      ],
    });
  };

  const removeMedicalHistoryItem = (index) => {
    const updated = (Array.isArray(patient?.medicalHistory)
      ? patient.medicalHistory
      : []
    ).filter((_, i) => i !== index);
    setPatient({ ...patient, medicalHistory: updated });
  };

  const saveMedicalInfo = async () => {
    try {
      setOnUpdate(true);
      const formData = new FormData();
      formData.append(
        "medicalHistory",
        JSON.stringify(
          Array.isArray(patient?.medicalHistory) ? patient.medicalHistory : []
        )
      );
      formData.append(
        "vitals",
        JSON.stringify(Array.isArray(patient?.vitals) ? patient.vitals : [])
      );
      formData.append(
        "medications",
        JSON.stringify(
          Array.isArray(patient?.medications) ? patient.medications : []
        )
      );
      if (prescriptionFile) {
        formData.append("prescription", prescriptionFile);
      }

      await api.patch("/patient/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Medical info updated successfully");
      setPrescriptionFile(null);
      await reloadPatient?.();
    } catch (error) {
      console.error("Error updating medical info:", error);
      toast.error(error.response?.data?.message || "Error updating medical info");
    } finally {
      setOnUpdate(false);
    }
  };

  if (!patient) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-greenPrimary flex items-center">
          <FaUpload className="mr-2" /> Uploaded Prescriptions
        </h3>
        {prescriptions.length === 0 ? (
          <p className="text-gray-600">No prescriptions uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {prescriptions
              .slice()
              .sort(
                (a, b) =>
                  new Date(b?.uploadedAt || 0).getTime() -
                  new Date(a?.uploadedAt || 0).getTime()
              )
              .map((p, idx) => (
                <div
                  key={`${p?.url ?? "prescription"}-${idx}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium text-gray-800">
                      {p?.originalName || "Prescription file"}
                    </div>
                    {p?.uploadedAt ? (
                      <div className="text-xs text-gray-500">
                        Uploaded: {new Date(p.uploadedAt).toLocaleString()}
                      </div>
                    ) : null}
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    {p?.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No link</span>
                    )}
                    {p?._id ? (
                      <button
                        type="button"
                        onClick={() => deletePrescription(p._id)}
                        disabled={onUpdate}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-greenPrimary flex items-center">
          <FaNotesMedical className="mr-2" /> Medical History
        </h3>
        {(Array.isArray(patient?.medicalHistory) ? patient.medicalHistory : []).map(
          (condition, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <Input
                handleChange={(e) =>
                  handleMedicalHistoryChange(index, "condition", e.target.value)
                }
                value={condition?.condition ?? ""}
                placeholder="Condition"
                customClass="w-1/2"
              />
              <Input
                handleChange={(e) =>
                  handleMedicalHistoryChange(
                    index,
                    "diagnosedDate",
                    e.target.value
                  )
                }
                value={formatDate(condition?.diagnosedDate)}
                type="date"
                customClass="w-1/3"
              />
              <Button
                label=""
                onClick={() => removeMedicalHistoryItem(index)}
                icon={<FaTrash />}
                variant="outlined"
                color="red-600"
                className="w-auto"
              />
            </div>
          )
        )}
        <Button
          label="Add Medical History"
          onClick={addMedicalHistoryItem}
          icon={<FaNotesMedical className="mr-2" />}
          className="mt-2"
        />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-greenPrimary flex items-center">
          <FaWeight className="mr-2" /> Vitals
        </h3>
        {(Array.isArray(patient?.vitals) ? patient.vitals : []).map(
          (vital, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Input
              handleChange={(e) =>
                handleVitalChange(index, "type", e.target.value)
              }
              value={vital.type}
              placeholder="Type"
              customClass="w-1/3"
            />
            <Input
              handleChange={(e) =>
                handleVitalChange(index, "value", e.target.value)
              }
              value={vital.value}
              placeholder="Value"
              customClass="w-1/3"
            />
            <Input
              handleChange={(e) =>
                handleVitalChange(index, "unit", e.target.value)
              }
              value={vital.unit}
              placeholder="Unit"
              customClass="w-1/4"
            />
            <Button
              label=""
              onClick={() => removeVital(index)}
              icon={<FaTrash />}
              variant="outlined"
              color="red-600"
              className="w-auto"
            />
          </div>
          )
        )}
        <Button
          label="Add Vital"
          onClick={addVital}
          icon={<FaWeight className="mr-2" />}
          className="mt-2"
        />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-greenPrimary flex items-center">
          <FaPills className="mr-2" /> Current Medications
        </h3>
        {(Array.isArray(patient?.medications) ? patient.medications : []).map(
          (medication, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <Input
              handleChange={(e) =>
                handleMedicationChange(index, "name", e.target.value)
              }
              value={medication?.name}
              placeholder="Name"
              customClass="w-1/3"
            />
            <Input
              handleChange={(e) =>
                handleMedicationChange(index, "dosage", e.target.value)
              }
              value={medication?.dosage}
              placeholder="Dosage"
              customClass="w-1/3"
            />
            <Input
              handleChange={(e) =>
                handleMedicationChange(index, "frequency", e.target.value)
              }
              value={medication?.frequency}
              placeholder="Frequency"
              customClass="w-1/4"
            />
            <Button
              label=""
              onClick={() => removeMedication(index)}
              icon={<FaTrash />}
              variant="outlined"
              color="red-600"
              className="w-auto"
            />
          </div>
          )
        )}
        <Button
          label="Add Medication"
          onClick={addMedication}
          icon={<FaPills className="mr-2" />}
          className="mt-2"
        />
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-greenPrimary flex items-center">
          <FaUpload className="mr-2" /> Prescription Upload
        </h3>
        <FileUpload
          handleChange={(e) => setPrescriptionFile(e.target.files?.[0] ?? null)}
          value={prescriptionFile}
          id="prescription"
          name="prescription"
          labelText="Upload Prescription (jpeg or pdf)"
          accept=".pdf,application/pdf,image/*"
        />
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t">
        <Button
          label={onUpdate ? "Updating..." : "Update Profile"}
          disabled={onUpdate}
          onClick={() => {
            saveMedicalInfo();
          }}
          icon={<FaUser className="mr-2" />}
          className="text-lg font-semibold"
        />
      </div>
    </div>
  );
};

export default MedicalInfoTab;
