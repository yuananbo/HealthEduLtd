import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../context/UserContext";
import api from "../../../../utils/api";
import Button from "../../../common/Button";
import { Link } from "react-router-dom";

const TherapistProfile = ({ darkMode }) => {
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get("/therapist/profile", {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (response.data) {
          setProfile(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentUser.token]);

  //   console.log("====================================");
  //   console.log("TherapistProfile:", profile);
  //   console.log("====================================");

  const SkeletonLoader = () => (
    <div
      className={`rounded-xl shadow-lg p-6 ${
        darkMode ? "bg-gray-800" : "bg-white"
      } animate-pulse`}
    >
      <div className="flex items-center mb-4">
        <div className="w-20 h-20 bg-gray-300 rounded-full mr-4"></div>
        <div>
          <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-20 bg-gray-300 rounded w-full mb-4"></div>
      <div className="h-10 bg-gray-300 rounded w-full"></div>
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
      <div className="flex items-center mb-4">
        <div className="relative">
          {profile?.therapist?.profilePicture ? (
            <img
              src={profile?.therapist?.profilePicture}
              alt="Therapist"
              className="w-20 h-20 rounded-full mr-4 border-4 border-indigo-500"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 text-xl mr-3">
              {profile?.therapist?.firstName
                ? profile?.therapist?.firstName[0].toUpperCase()
                : ""}
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center">
            <h2 className="text-2xl font-bold mr-2">
              Dr. {profile?.therapist?.firstName} {profile?.lastName}
            </h2>
            <span
              className={`bg-blue-500 text-white rounded-full p-1`}
              title="Verified Account"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </span>
          </div>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {profile?.therapist?.specialization}
          </p>
        </div>
      </div>
      <div className="flex items-center mb-2">
        <i
          className={`fas fa-map-marker-alt mr-2 ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        ></i>
        <span>
          {profile?.therapist?.address?.country}{" "}
          {profile?.therapist?.address?.city}
        </span>
      </div>
      <div className="flex items-center mb-4">
        <i className="fas fa-star text-yellow-400 mr-2"></i>
        <span>
          {profile?.averageRating.toFixed(1)} (
          {profile?.therapist?.ratings.length} reviews)
        </span>
      </div>
      <p
        className={`mb-4 ${
          darkMode ? "text-gray-300" : "text-gray-600"
        } line-clamp-3`}
      >
        {profile?.therapist?.bio}
      </p>

      <Link to="/therapist/profile">
        <Button label={"Edit Profile"} variant="filled" />
      </Link>
    </div>
  );
};

export default TherapistProfile;
