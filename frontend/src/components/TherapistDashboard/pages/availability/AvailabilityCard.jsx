import React, { useState, useRef, useEffect } from "react";
import moment from "moment";
import {
  AiOutlineEllipsis,
  AiOutlineEdit,
  AiOutlineDelete,
} from "react-icons/ai";
import { BiPowerOff } from "react-icons/bi";
import { useAvailability } from "../../../../hooks/useAvailability";
import toast from "react-hot-toast";

const AvailabilityCard = ({ availability, onUpdate, onEdit }) => {
  const { id, name, dates, isActive } = availability;
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const {
    activateAvailability,
    deactivateAvailability,
    deleteAvailability,
    toggleTimeSlotStatus,
    isLoading,
    error,
  } = useAvailability(onUpdate);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{name}</h2>
        <div className="relative" ref={dropdownRef}>
          <button
            className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-full hover:bg-gray-100"
            onClick={toggleDropdown}
          >
            <AiOutlineEllipsis className="w-5 h-5" />
          </button>
          <ActionDropdown
            show={showDropdown}
            onClose={() => setShowDropdown(false)}
            availabilityId={id}
            availability={availability}
            isActive={isActive}
            onActivate={activateAvailability}
            onDeactivate={deactivateAvailability}
            onDelete={deleteAvailability}
            onEdit={onEdit}
          />
        </div>
      </div>
      <div className="space-y-3">
        {dates.map((dateAvailability, index) => (
          <div
            key={index}
            className="border-t pt-3 first:border-t-0 first:pt-0"
          >
            <p className="text-gray-600">
              <span className="font-semibold">Date:</span>{" "}
              {moment(dateAvailability.date).format("MMMM Do, YYYY")}
            </p>
            <div>
              <span className="font-semibold text-gray-700">Times:</span>
              <ul className="mt-2 space-y-1">
                {dateAvailability.times.map((time, timeIndex) => (
                  <li key={timeIndex} className="flex items-center gap-2 mb-2">
                    <span
                      className={`rounded px-3 py-1 inline-block ${
                        time.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600 line-through"
                      }`}
                    >
                      {time.time}
                    </span>
                    <button
                      className={`text-xs px-2 py-1 rounded ${
                        time.isActive
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                      onClick={async () => {
                        try {
                          await toggleTimeSlotStatus(
                            id,
                            dateAvailability.date,
                            time.time,
                            !time.isActive
                          );
                          toast.success(
                            `Time slot ${!time.isActive ? "activated" : "deactivated"}`
                          );
                        } catch (slotError) {
                          toast.error(slotError.message || "Failed to update time slot");
                        }
                      }}
                    >
                      {time.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActionDropdown = ({
  show,
  onClose,
  availabilityId,
  availability,
  isActive,
  onActivate,
  onDeactivate,
  onDelete,
  onEdit,
}) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  if (!show) return null;

  const handleAction = async (action) => {
    try {
      await action(availabilityId);
      toast.success("Action completed successfully");
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      onClose();
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-10">
        <button
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
          onClick={() => handleAction(isActive ? onDeactivate : onActivate)}
        >
          <BiPowerOff className="mr-2" />
          {isActive ? "Deactivate All" : "Activate All"}
        </button>
        <button
          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
          onClick={() => {
            onEdit(availability);
            onClose();
          }}
        >
          <AiOutlineEdit className="mr-2" />
          Edit
        </button>
        <button
          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-100 w-full"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          <AiOutlineDelete className="mr-2" />
          Delete
        </button>
      </div>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Delete Availability
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete this availability? This action
                  cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => handleAction(onDelete)}
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AvailabilityCard;
