import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";
import Loading from "../../../utilities/Loading";
import { adminBaseURL } from "../../../../utils/adminApi";

// const adminBaseLocalURL = "http://localhost:5000/api/admin";
// const adminBaseURL = "https://mobirehab.onrender.com/api/admin";

const AllTherapist = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useContext(UserContext);

  const [therapists, setTherapists] = useState([]);

  const getAllTherapists = async () => {
    if (!currentUser || !currentUser.token) {
      console.error("Token is missing or undefined");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${adminBaseURL}/therapists`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        setTherapists(response?.data?.data);
      } else {
        console.error(
          "Failed to fetch therapists: Unexpected response status",
          response.status
        );
      }
    } catch (error) {
      console.error(
        "Error fetching therapists:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch therapists on component mount or when currentUser changes
  useEffect(() => {
    // console.log("currentUser:", currentUser);
    if (currentUser && currentUser.token) {
      getAllTherapists();
    }
  }, [currentUser.token]);

  const filteredTherapists = therapists.filter((therapist) =>
    `${therapist?.firstName} ${therapist?.lastName}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading />;
  }
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Therapists List</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search therapists..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-lg rounded-lg">
          <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <tr>
              <th className="py-3 px-6 text-left">
                <input type="checkbox" className="form-checkbox" />
              </th>
              <th className="py-3 px-6 text-left">Profile</th>
              <th className="py-3 px-6 text-left">Full Name</th>
              <th className="py-3 px-6 text-left">Signup Date</th>
              <th className="py-3 px-6 text-left">Status</th>
              <th className="py-3 px-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {filteredTherapists.map((therapist) => (
              <tr
                key={therapist?._id}
                className="border-b border-gray-200 hover:bg-gray-100"
              >
                <td className="py-3 px-6 text-left">
                  <input type="checkbox" className="form-checkbox" />
                </td>
                <td className="py-3 px-6 text-left whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="mr-2">
                      <img
                        src={therapist.profilePicture}
                        alt={`${therapist?.firstName} ${therapist?.lastName}`}
                        className="h-10 w-10 rounded-full"
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-6 text-left">
                  {therapist?.firstName} {therapist?.lastName}
                </td>
                <td className="py-3 px-6 text-left">
                  {new Date(therapist?.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-6 text-left">
                  <span
                    className={`py-1 px-3 rounded-full text-xs ${
                      therapist?.isVerified
                        ? "bg-green-200 text-green-600"
                        : "bg-red-200 text-red-600"
                    }`}
                  >
                    {therapist?.isVerified ? "Verified" : "Not Verified"}
                  </span>
                </td>
                <td className="py-3 px-6 text-center">
                  <Link
                    to={`/admin/therapists/${therapist?._id}`}
                    className="text-blue-500 hover:underline"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllTherapist;
