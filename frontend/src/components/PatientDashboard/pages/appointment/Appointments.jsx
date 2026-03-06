import React, { useState, useEffect } from "react";
import useDataFetching from "../../../../hooks/useFech";
import AppointmentItem from "./AppointmentItem";
import { Link } from "react-router-dom";
import { FiSearch, FiFilter, FiCalendar, FiPlus } from "react-icons/fi";
import Loading from "../../../utilities/Loading";
import toast from "react-hot-toast";
import api from "../../../../utils/api";

const Appointments = () => {
  const [loading, error, data, refetch] = useDataFetching(
    "/patient/appointments?limit=50"
  );
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  // console.log("filterexd", filteredData);

  useEffect(() => {
    if (data && data.data) {
      let filtered = data.data;

      if (searchTerm) {
        filtered = filtered.filter(
          (appointment) => {
            const therapistName =
              typeof appointment?.therapist === "object" && appointment?.therapist
                ? `${appointment.therapist.firstName || ""} ${
                    appointment.therapist.lastName || ""
                  } ${appointment.therapist.specialization || ""}`
                : String(appointment?.therapist || "");

            return (
              therapistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              String(appointment?.status || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            );
          }
        );
      }

      if (statusFilter !== "All") {
        filtered = filtered.filter(
          (appointment) => appointment.status === statusFilter
        );
      }

      if (dateFilter) {
        filtered = filtered.filter(
          (appointment) =>
            new Date(appointment.createdAt).toDateString() ===
            new Date(dateFilter).toDateString()
        );
      }

      setFilteredData(filtered);
    }
  }, [data, searchTerm, statusFilter, dateFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAppointments(filteredData.map((app) => app._id));
    } else {
      setSelectedAppointments([]);
    }
  };

  const handleSelect = (id) => {
    setSelectedAppointments((prev) =>
      prev.includes(id) ? prev.filter((appId) => appId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    if (action === "cancel") {
      bulkCancelSelected();
      return;
    }
    toast("Bulk action not implemented yet");
  };

  const bulkCancelSelected = async () => {
    if (selectedAppointments.length === 0) return;
    const confirm = window.confirm(
      `Cancel ${selectedAppointments.length} selected appointment(s)?`
    );
    if (!confirm) return;

    try {
      setBulkLoading(true);
      const results = await Promise.allSettled(
        selectedAppointments.map((id) =>
          api.patch(`/patient/appointments/${id}/cancel`)
        )
      );

      const successCount = results.filter((r) => r.status === "fulfilled")
        .length;
      const failed = results
        .filter((r) => r.status === "rejected")
        .map((r) => r.reason);

      if (successCount > 0) {
        toast.success(`Cancelled ${successCount} appointment(s)`);
      }
      if (failed.length > 0) {
        const firstMessage =
          failed[0]?.response?.data?.message ||
          failed[0]?.response?.data?.error ||
          failed[0]?.message ||
          "Some appointments could not be cancelled";
        toast.error(
          `Failed to cancel ${failed.length} appointment(s). ${firstMessage}`
        );
      }

      setSelectedAppointments([]);
      refetch();
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e?.message || "Bulk cancel failed"
      );
    } finally {
      setBulkLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg">
        <p className="font-semibold">Error:</p>
        <p>{error}</p>
      </div>
    );
  }

  // Check if there are no appointments
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="p-4 md:p-6 bg-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Appointments</h1>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            No appointments yet
          </h2>
          <p className="text-gray-500 mb-8">
            Book your first appointment to get started
          </p>
          <Link
            to="/patient/therapist-list"
            className="bg-greenPrimary hover:bg-hoverColor text-white font-bold py-3 px-6 rounded inline-flex items-center transition duration-150 ease-in-out"
          >
            <FiPlus className="mr-2" />
            Book Appointment
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Appointments
        </h1>
        <Link
          to="/patient/therapist-list"
          className="bg-greenPrimary hover:bg-hoverColor text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-150 ease-in-out"
        >
          <FiPlus className="mr-2" />
          Book Appointment
        </Link>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search appointments..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <select
              className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <FiFilter className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="date"
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <FiCalendar className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>

      {selectedAppointments.length > 0 && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <span>{selectedAppointments.length} appointments selected</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("cancel")}
              disabled={bulkLoading}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              {bulkLoading ? "Cancelling..." : "Cancel Selected"}
            </button>
            <button
              onClick={() => handleBulkAction("reschedule")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
            >
              Reschedule Selected
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="p-4">
                <input
                  type="checkbox"
                  checked={selectedAppointments.length === filteredData.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-greenPrimary bg-gray-100 border-gray-300 rounded focus:ring-hoverColor"
                />
              </th>
              <th scope="col" className="px-6 py-3">
                Therapist
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3">
                Appointment Date
              </th>
              <th scope="col" className="px-6 py-3">
                Appointment Time
              </th>
              <th scope="col" className="px-6 py-3">
                Created At
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((appointment) => (
              <AppointmentItem
                key={appointment._id}
                appointment={appointment}
                isSelected={selectedAppointments.includes(appointment._id)}
                onSelect={() => handleSelect(appointment._id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
