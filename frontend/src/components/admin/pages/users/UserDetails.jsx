import axios from "axios";
import PropTypes from "prop-types";
import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { UserContext } from "../../../../context/UserContext";
import Loading from "../../../utilities/Loading";
import { adminBaseURL } from "../../../../utils/adminApi";

const statusStyles = {
  active: "bg-green-200 text-green-700",
  pending: "bg-yellow-200 text-yellow-700",
  inactive: "bg-red-200 text-red-700",
};

const Row = ({ label, value }) => (
  <div className="border-b border-gray-100 py-3">
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-800">{value || "-"}</p>
  </div>
);

Row.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Row.defaultProps = {
  value: "-",
};

const UserDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { currentUser } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const currentUserType = searchParams.get("userType") || "";

  const fetchUser = useCallback(async () => {
    if (!currentUser?.token || !id) {
      return;
    }

    // Detail requests preserve the userType hint from the list page so the
    // backend can resolve the correct collection with fewer fallback checks.
    setLoading(true);
    try {
      const response = await axios.get(`${adminBaseURL}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
          "Content-Type": "application/json",
        },
        params: {
          userType: currentUserType,
        },
      });

      if (response.status === 200) {
        setUser(response?.data?.data || null);
      }
    } catch (error) {
      console.error(
        "Error fetching user details:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token, currentUserType, id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleStatusChange = async (nextStatus) => {
    try {
      const response = await axios.patch(
        `${adminBaseURL}/users/${id}/status`,
        {
          userType: user.userType,
          status: nextStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("User status updated");
        // Rehydrate the full detail payload because one status change can also
        // affect related account fields shown on this page.
        fetchUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="rounded-lg bg-white p-8 shadow-sm">
        <p className="text-gray-600">User details could not be loaded.</p>
        <Link to="/admin/users" className="mt-4 inline-block text-blue-600">
          Back to Users
        </Link>
      </div>
    );
  }

  const { basicInfo, accountInfo, businessInfo } = user;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin/users" className="text-sm text-blue-600">
            Back to Users
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-gray-800">
            {user.fullName}
          </h1>
          <p className="text-sm text-gray-500 capitalize">{user.userType}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm ${
            statusStyles[accountInfo.status] || "bg-gray-200 text-gray-700"
          }`}
        >
          {accountInfo.status}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {accountInfo.status === "active" ? (
          <button
            onClick={() => handleStatusChange("inactive")}
            className="rounded-md bg-red-500 px-4 py-2 text-sm text-white"
          >
            Deactivate
          </button>
        ) : null}
        {accountInfo.status === "inactive" ? (
          <button
            onClick={() => handleStatusChange("active")}
            className="rounded-md bg-green-600 px-4 py-2 text-sm text-white"
          >
            Activate
          </button>
        ) : null}
        {user.userType === "therapist" && accountInfo.status === "pending" ? (
          <>
            <button
              onClick={() => handleStatusChange("active")}
              className="rounded-md bg-green-600 px-4 py-2 text-sm text-white"
            >
              Approve
            </button>
            <button
              onClick={() => handleStatusChange("inactive")}
              className="rounded-md bg-red-500 px-4 py-2 text-sm text-white"
            >
              Reject
            </button>
          </>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Basic Info
          </h2>
          <Row label="First Name" value={basicInfo.firstName} />
          <Row label="Last Name" value={basicInfo.lastName} />
          <Row label="Email" value={basicInfo.email} />
          <Row label="Phone Number" value={basicInfo.phoneNumber} />
          <Row
            label="Alternative Phone"
            value={basicInfo.alternativePhoneNumber}
          />
          <Row label="User Type" value={basicInfo.userType} />
          <Row
            label="Address"
            value={[
              basicInfo.address?.street,
              basicInfo.address?.district,
              basicInfo.address?.city,
              basicInfo.address?.country,
            ]
              .filter(Boolean)
              .join(", ")}
          />
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Account Info
          </h2>
          <Row label="Status" value={accountInfo.status} />
          <Row
            label="Is Active"
            value={accountInfo.isActive ? "Yes" : "No"}
          />
          <Row
            label="Is Verified"
            value={accountInfo.isVerified ? "Yes" : "No"}
          />
          <Row
            label="Registered At"
            value={new Date(accountInfo.createdAt).toLocaleString()}
          />
          <Row
            label="Updated At"
            value={new Date(accountInfo.updatedAt).toLocaleString()}
          />
          <Row
            label="Last Login"
            value={
              accountInfo.lastLoginAt
                ? new Date(accountInfo.lastLoginAt).toLocaleString()
                : "-"
            }
          />
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Business Info
          </h2>

          {user.userType === "patient" ? (
            <>
              <Row label="Patient ID" value={businessInfo.patientId} />
              <Row
                label="Appointment Count"
                value={String(businessInfo.appointmentCount)}
              />
              <Row
                label="Saved Content Count"
                value={String(businessInfo.savedContentCount)}
              />
              <Row label="Gender" value={businessInfo.gender} />
              <Row
                label="Date of Birth"
                value={
                  businessInfo.dateOfBirth
                    ? new Date(businessInfo.dateOfBirth).toLocaleDateString()
                    : "-"
                }
              />
              <Row label="Age" value={String(businessInfo.age || "-")} />
              <Row label="Height" value={String(businessInfo.height || "-")} />
              <Row label="Weight" value={String(businessInfo.weight || "-")} />
              <Row label="Blood Type" value={businessInfo.bloodType} />
            </>
          ) : null}

          {user.userType === "therapist" ? (
            <>
              <Row label="Therapist ID" value={businessInfo.therapistId} />
              <Row label="Profession" value={businessInfo.profession} />
              <Row
                label="Specialization"
                value={businessInfo.specialization}
              />
              <Row
                label="Experience"
                value={businessInfo.numOfYearsOfExperience}
              />
              <Row
                label="Appointment Count"
                value={String(businessInfo.appointmentCount)}
              />
              <Row
                label="Profile Picture Uploaded"
                value={
                  businessInfo.documentUploadStatus?.hasProfilePicture
                    ? "Yes"
                    : "No"
                }
              />
              <Row
                label="CV Uploaded"
                value={businessInfo.documentUploadStatus?.hasCv ? "Yes" : "No"}
              />
              <Row
                label="License Uploaded"
                value={
                  businessInfo.documentUploadStatus?.hasLicenseDocument
                    ? "Yes"
                    : "No"
                }
              />
            </>
          ) : null}

          {user.userType === "admin" || user.userType === "super-admin" ? (
            <>
              <Row label="Admin ID" value={businessInfo.adminId} />
              <Row label="Role" value={businessInfo.role} />
              <div className="py-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Permissions
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(businessInfo.permissions || []).map((permission) => (
                    <span
                      key={permission}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default UserDetails;
