import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import Input from "../../../common/forms/Input";
import CustomPhoneInput from "../../../common/forms/PhoneInput";
import CustomDropdown from "../../../common/forms/CustomDropdown";
import CustomCountryDropdown from "../../../common/forms/CustomCountryDropdown";
import Button from "../../../common/Button";

const PersonalTab = ({ formData, handleChange, handleSubmit, updating }) => {
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (formData.profilePicture instanceof File) {
      const url = URL.createObjectURL(formData.profilePicture);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPhotoPreview(null);
    return undefined;
  }, [formData.profilePicture]);

  const displayPhoto =
    photoPreview ||
    (typeof formData.profilePicture === "string" && formData.profilePicture.trim()
      ? formData.profilePicture
      : null);

  const initial =
    formData.firstName && formData.firstName[0]
      ? formData.firstName[0].toUpperCase()
      : "?";

  return (
  <div className="space-y-6">
    <h3 className="text-2xl font-bold text-gray-800">Personal Information</h3>

    <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:flex-row sm:items-start">
      <div className="relative shrink-0">
        {displayPhoto ? (
          <img
            src={displayPhoto}
            alt="Your profile"
            className="h-32 w-32 rounded-full border-4 border-blue-500 object-cover shadow-md"
          />
        ) : (
          <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-blue-500 bg-blue-100 text-4xl font-bold text-blue-700 shadow-md">
            {initial}
          </div>
        )}
        <label
          htmlFor="therapist-profile-picture"
          className="absolute bottom-1 right-1 cursor-pointer rounded-full bg-white p-2.5 text-blue-600 shadow-md transition hover:bg-blue-500 hover:text-white"
          title="Change profile photo"
        >
          <FaCamera className="text-lg" />
          <input
            type="file"
            id="therapist-profile-picture"
            name="profilePicture"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </label>
      </div>
      <div className="text-center text-sm text-slate-600 sm:text-left">
        <p className="font-medium text-slate-800">Profile photo</p>
        <p className="mt-1 max-w-md">
          Upload a clear headshot. After choosing an image, click &quot;Save Updates&quot;
          to save. The file is stored on this server (same as patient prescription uploads),
          not on Cloudinary.
        </p>
      </div>
    </div>

    <div className="flex flex-wrap -mx-3">
      <div className="w-full sm:w-1/2 px-3 mb-6">
        <Input
          label="First Name"
          handleChange={handleChange}
          value={formData.firstName}
          labelText="First Name"
          labelFor="firstName"
          id="firstName"
          name="firstName"
          type="text"
        />
      </div>
      <div className="w-full sm:w-1/2 px-3 mb-6">
        <Input
          handleChange={handleChange}
          value={formData.lastName}
          labelText="Last Name"
          labelFor="lastName"
          id="lastName"
          name="lastName"
          type="text"
          isRequired={true}
          placeholder="Last Name"
        />
      </div>
      <div className="w-full sm:w-1/2 px-3 mb-6">
        <Input
          handleChange={handleChange}
          value={formData.email}
          labelText="Email Address"
          labelFor="email"
          id="email"
          name="email"
          type="email"
          isRequired={true}
          placeholder="example@email.com"
        />
      </div>
      <div className="w-full sm:w-1/2 px-3 mb-6">
        <CustomPhoneInput
          country={"rw"}
          labelText={"Phone Number"}
          labelFor="phoneNumber"
          value={formData.phoneNumber}
          onChange={(phone) =>
            handleChange({
              target: { name: "phoneNumber", value: phone },
            })
          }
          placeholder="Phone Number"
        />
      </div>
      <div className="w-full sm:w-1/2 px-3 mb-6">
        <CustomDropdown
          handleChange={handleChange}
          value={formData.gender}
          labelText="Gender"
          labelFor="gender"
          id="gender"
          name="gender"
          isRequired={true}
          options={["Male", "Female"]}
          placeholder="Gender"
        />
      </div>
      <div className="w-full sm:w-1/2 px-3 mb-6">
        <CustomCountryDropdown
          value={formData.address.country}
          handleChange={(country) =>
            handleChange({
              target: { name: "country", value: country },
            })
          }
          name="country"
          labelFor="country"
          labelText="Country"
        />
      </div>
      <div className="w-full sm:w-1/2 px-3 mb-6">
        <CustomCountryDropdown
          country={formData.address.country}
          value={formData.address.city}
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
      </div>
      <div className="w-full sm:w-1/2 px-3 mb-6">
        <Input
          handleChange={handleChange}
          value={formData.address.district}
          labelText="District"
          labelFor="district"
          id="district"
          name="district"
          type="text"
          placeholder="District"
        />
      </div>
      <div className="w-full sm:w-1/2 px-3 mb-6">
        <Input
          handleChange={handleChange}
          value={formData.address.street}
          labelText="Street"
          labelFor="street"
          id="street"
          name="street"
          type="text"
          placeholder="Street Address"
        />
      </div>
      <div className="w-full px-3 mb-6">
        <Input
          handleChange={handleChange}
          value={formData.bio}
          labelText="Professional Bio"
          labelFor="bio"
          id="bio"
          name="bio"
          isRequired={true}
          placeholder="Tell us about yourself and your professional experience."
          component="textarea"
        />
      </div>
    </div>

    <div className="flex justify-end px-3">
      <Button
        onClick={handleSubmit}
        variant="filled"
        disabled={updating}
        label={updating ? "Updating..." : "Save Updates"}
      />
    </div>
  </div>
  );
};

export default PersonalTab;
