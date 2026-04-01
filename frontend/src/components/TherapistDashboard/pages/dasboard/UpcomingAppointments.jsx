import React, { useContext, useEffect } from "react";
import UpcomingAppointmentCard from "./UpcomingAppointmentCard";
import { UserContext } from "../../../../context/UserContext";
import useDataFetching from "../../../../hooks/useFech";

const UpcomingAppointments = ({ darkMode }) => {
  const [loading, error, data, fetchData] = useDataFetching(
    "upcoming-appointments"
  );
  const { currentUser } = useContext(UserContext);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const SkeletonLoader = () => (
    <div
      className={`rounded-xl shadow-lg p-6 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-12 w-12"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div
      className={`rounded-xl shadow-lg p-6 ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
      {loading ? (
        <p>Loading Appointments...</p>
      ) : error ? (
        <p>Error loading appointments</p>
      ) : (
        <>
          {data?.data?.length > 0 ? (
            <div className="space-y-4">
              {data.data.map((appointment) => (
                <UpcomingAppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  userType={currentUser?.data?.user?.userType}
                  darkMode={darkMode}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No upcoming appointments</p>
          )}
        </>
      )}
    </div>
  );
};

export default UpcomingAppointments;
