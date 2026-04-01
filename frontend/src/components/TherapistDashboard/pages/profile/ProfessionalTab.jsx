import React from "react";

import FileUpload from "./FileUpload";
import Input from "../../../common/forms/Input";
import Button from "../../../common/Button";
import CustomDropdown from "../../../common/forms/CustomDropdown";

const ProfessionalTab = ({
  formData,
  handleChange,
  handleSubmit,
  updating,
}) => (
  <div className="max-w-3xl mx-auto space-y-8">
    <h3 className="text-2xl font-bold text-gray-800">
      Professional Information
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <CustomDropdown
        handleChange={handleChange}
        value={formData?.specialization}
        labelText="Specialization"
        labelFor="specialization"
        id="specialization"
        name="specialization"
        isRequired={true}
        options={[
          "Physiotherapist",
          "Occupational Therapist",
          "Prosthetist and Orthotist",
          "Nurse",
          "Nutritionist",
          "Counsellor",
          "Medical Doctor",
        ]}
        placeholder="Select specialization"
      />
      <Input
        handleChange={handleChange}
        value={formData?.licenseNumber}
        labelText="Professional License Number"
        labelFor="licenseNumber"
        id="licenseNumber"
        name="licenseNumber"
        type="text"
        isRequired={true}
        placeholder="Your license number"
      />
      <Input
        handleChange={handleChange}
        value={formData?.numOfYearsOfExperience}
        labelText="Years of Experience"
        labelFor="numOfYearsOfExperience"
        id="numOfYearsOfExperience"
        name="numOfYearsOfExperience"
        type="number"
        isRequired={true}
        placeholder="10"
      />
      <Input
        handleChange={handleChange}
        value={formData?.profession}
        labelText="Current Profession / Specialization"
        labelFor="profession"
        id="profession"
        name="profession"
        type="text"
        isRequired={true}
        placeholder="Your current role or specialization"
      />
    </div>
    <div className="space-y-6">
      <FileUpload
        label="Medical License"
        currentFile={formData?.licenseDocument}
      />
      <FileUpload label="CV" currentFile={formData?.cv} />
    </div>
    <div className="flex justify-end">
      <Button
        onClick={handleSubmit}
        variant="filled"
        disabled={updating}
        label={updating ? "Updating..." : "Save Updates"}
      />
    </div>
  </div>
);

export default ProfessionalTab;
