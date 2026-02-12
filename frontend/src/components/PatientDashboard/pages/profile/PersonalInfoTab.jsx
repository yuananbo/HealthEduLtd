import React, { useContext, useEffect, useState } from "react";
import {
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaCity,
  FaRoad,
  FaBuilding,
  FaCamera,
  FaIdCard,
} from "react-icons/fa";
import Input from "../../../common/forms/Input";
import { UserContext } from "../../../../context/UserContext";
import api from "../../../../utils/api";
import Loading from "../../../utilities/Loading";
import Button from "../../../common/Button";
import { formatDate } from "../../../../utils/dateFormater";
import toast from "react-hot-toast";
import CustomPhoneInput from "../../../common/forms/PhoneInput";
import CustomDropdown from "../../../common/forms/CustomDropdown";
import CustomCountryDropdown from "../../../common/forms/CustomCountryDropdown";

const PersonalInfoTab = () => {
  const [patient, setPatient] = useState([]);
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(patient.profilePicture);
  const [onUpdate, setOnUpdate] = useState(false);

  const getPatientData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/patient/profile`);
      setPatient(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching patient data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getPatientData();
  }, []);

  console.log("Patient Data:", patient);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (
      name === "country" ||
      name === "city" ||
      name === "district" ||
      name === "street"
    ) {
      setPatient((prevPatient) => ({
        ...prevPatient,
        address: {
          ...prevPatient.address,
          [name]: value,
        },
      }));
    } else {
      setPatient((prevPatient) => ({
        ...prevPatient,
        [name]: type === "file" ? files[0] : value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setPatient((prevPatient) => ({
          ...prevPatient,
          profilePicture: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePatientProfile = async () => {
    try {
      setOnUpdate(true);
      const formData = new FormData();
      for (const key in patient) {
        if (key === "profilePicture") {
          formData.append("profilePicture", patient.profilePicture);
        } else if (key === "address") {
          for (const addressKey in patient.address) {
            formData.append(
              `address.${addressKey}`,
              patient.address[addressKey]
            );
          }
        } else {
          formData.append(key, patient[key]);
        }
      }

      const response = await api.patch("/patient/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile updated successfully");
      getPatientData();
      setOnUpdate(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Error updating profile");
      setOnUpdate(false);
    }
  };

  const getInitial = () => {
    return patient.firstName ? patient.firstName[0].toUpperCase() : "?";
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
        <div className="relative">
          {imagePreview || patient?.profilePicture ? (
            <img
              src={imagePreview ? imagePreview : patient.profilePicture}
              alt="Profile"
              className="w-48 h-48 rounded-full object-cover border-4 border-greenPrimary shadow-lg transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-48 h-48 rounded-full bg-greenPrimary flex items-center justify-center text-white text-6xl font-bold shadow-lg">
              {getInitial()}
            </div>
          )}
          <label
            htmlFor="profilePicture"
            className="absolute bottom-2 right-2 bg-white text-greenPrimary p-3 rounded-full cursor-pointer hover:bg-blueHover hover:text-white transition duration-300 shadow-md"
          >
            <FaCamera className="text-xl" />
            <input
              type="file"
              id="profilePicture"
              name="profilePicture"
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </label>
        </div>
        <div className="md:flex-1 text-center md:text-left">
          <h2 className="text-5xl font-bold text-greenPrimary mb-4">
            {`${patient?.firstName} ${patient?.lastName}`}
          </h2>
          <div className="flex items-center justify-center md:justify-start text-xl text-gray-600 mb-4">
            <FaIdCard className="mr-2 text-greenPrimary" />
            <span>
              Patient ID:{" "}
              <span className="text-blueColor font-semibold">
                {patient?.patientId}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Personal Details */}
        <div className="space-y-8">
          <h3 className="text-3xl font-semibold text-greenPrimary mb-6 border-b-2 border-greenPrimary pb-2">
            Basic Details
          </h3>
          <Input
            handleChange={handleChange}
            value={patient?.firstName}
            labelText="First Name"
            labelFor="firstName"
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Enter your first name"
            icon={<FaUser className="text-greenPrimary text-xl" />}
          />
          <Input
            handleChange={handleChange}
            value={patient?.lastName}
            labelText="Last Name"
            labelFor="lastName"
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Enter your last name"
            icon={<FaUser className="text-greenPrimary text-xl" />}
          />
          <Input
            handleChange={handleChange}
            value={patient?.email}
            labelText="Email"
            labelFor="email"
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            icon={<FaEnvelope className="text-greenPrimary text-xl" />}
          />
          <Input
            handleChange={handleChange}
            value={patient?.phoneNumber}
            labelText="Phone Number"
            labelFor="phoneNumber"
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="Enter your phone number"
            icon={<FaPhone className="text-greenPrimary text-xl" />}
          />
        </div>

        {/* Additional Details */}
        <div className="space-y-8">
          <h3 className="text-3xl font-semibold text-greenPrimary mb-6 border-b-2 border-greenPrimary pb-2">
            Additional Details
          </h3>
          <Input
            handleChange={handleChange}
            value={formatDate(patient?.dateOfBirth)}
            labelText="Date of Birth"
            labelFor="dateOfBirth"
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            icon={<FaCalendarAlt className="text-greenPrimary text-xl" />}
          />
          <Input
            handleChange={handleChange}
            value={patient?.height ?? ""}
            labelText="Height (cm)"
            labelFor="height"
            id="height"
            name="height"
            type="number"
            placeholder="e.g. 165"
            icon={<FaUser className="text-greenPrimary text-xl" />}
          />
          <Input
            handleChange={handleChange}
            value={patient?.weight ?? ""}
            labelText="Weight (kg)"
            labelFor="weight"
            id="weight"
            name="weight"
            type="number"
            placeholder="e.g. 60"
            icon={<FaUser className="text-greenPrimary text-xl" />}
          />
          <CustomDropdown
            handleChange={handleChange}
            value={patient?.bloodType ?? ""}
            labelText="Blood Type"
            labelFor="bloodType"
            id="bloodType"
            name="bloodType"
            isRequired={false}
            options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
            placeholder="Select blood type"
          />
          <CustomDropdown
            handleChange={handleChange}
            value={patient?.gender}
            labelText="Gender"
            labelFor="gender"
            id="gender"
            name="gender"
            isRequired={true}
            options={["Male", "Female"]}
            placeholder="Gender"
          />
          <CustomPhoneInput
            country={"rw"}
            labelText={"Phone Number"}
            labelFor="phoneNumber"
            value={patient?.phoneNumber}
            onChange={(phone) =>
              handleChange({
                target: { name: "phoneNumber", value: phone },
              })
            }
            placeholder="Phone Number"
          />

          <CustomPhoneInput
            country={"rw"}
            labelText="Emergency Contact"
            labelFor="emergencyContact"
            value={patient?.guardianPhoneNumber}
            onChange={(phone) =>
              handleChange({
                target: { name: "guardianPhoneNumber", value: phone },
              })
            }
            placeholder="Phone Number"
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="mt-16">
        <h3 className="text-3xl font-semibold text-greenPrimary mb-8 border-b-2 border-greenPrimary pb-2">
          Address Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CustomCountryDropdown
            value={patient?.address?.country}
            handleChange={(country) =>
              handleChange({
                target: { name: "country", value: country },
              })
            }
            name="country"
            labelFor="country"
            labelText="Country"
          />
          <CustomCountryDropdown
            country={patient?.address?.country}
            value={patient?.address?.city}
            handleChange={(city) =>
              handleChange({
                target: { name: "city", value: city },
              })
            }
            name="city"
            labelFor="city"
            labelText="Region/City"
            dropdownType="region"
          />
          <Input
            handleChange={handleChange}
            value={patient?.address?.district}
            labelText="District"
            labelFor="district"
            id="district"
            name="district"
            type="text"
            placeholder="Enter your district"
            icon={<FaMapMarkerAlt className="text-greenPrimary text-xl" />}
          />
          <Input
            handleChange={handleChange}
            value={patient?.address?.street}
            labelText="Street"
            labelFor="street"
            id="street"
            name="street"
            type="text"
            placeholder="Enter your street"
            icon={<FaRoad className="text-greenPrimary text-xl" />}
          />
          <Input
            handleChange={handleChange}
            value={patient?.buildingNumber}
            labelText="Building Number"
            labelFor="buildingNumber"
            id="buildingNumber"
            name="buildingNumber"
            type="text"
            placeholder="Enter building number"
            icon={<FaBuilding className="text-greenPrimary text-xl" />}
          />
          <Input
            handleChange={handleChange}
            value={patient.postalCode}
            labelText="Postal Code"
            labelFor="postalCode"
            id="postalCode"
            name="postalCode"
            type="text"
            placeholder="Enter postal code"
            icon={<FaMapMarkerAlt className="text-greenPrimary text-xl" />}
          />
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t">
        <Button
          label={onUpdate ? "Updating..." : "Update Profile"}
          disabled={onUpdate}
          onClick={() => {
            updatePatientProfile();
          }}
          icon={<FaUser className="mr-2" />}
          className="text-lg font-semibold"
        />
      </div>
    </div>
  );
};

export default PersonalInfoTab;
