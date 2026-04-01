import React from "react";
import FileUpload from "../../../common/forms/FileUpload";
import ImageUpload from "../../../common/forms/ImageUpload";

const RequiredFiles = ({ formData, handleChange }) => (
  <>
    <div className="flex flex-wrap -mx-3 mb-0 lg:mb-10">
      <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
        <FileUpload
          handleChange={handleChange}
          value={formData.licenseDocument}
          id="license-document-upload"
          name="licenseDocument"
          isRequired={true}
          labelText="Upload License Document"
        />
      </div>
      <div className="w-full md:w-1/2 px-3 mb-4 md:mb-0">
        <FileUpload
          handleChange={handleChange}
          value={formData.cv}
          id="cv-upload"
          name="cv"
          isRequired={true}
          labelText="Upload CV"
        />
      </div>
    </div>

    <div className="flex flex-wrap -mx-3 mb-0 lg:mb-4">
      <div className="w-full px-3 mb-4 md:mb-0">
        <ImageUpload
          handleChange={handleChange}
          value={formData.profilePicture}
          id="profile-picture-upload"
          name="profilePicture"
          isRequired={true}
          labelText="Upload Profile Picture"
          customClass="mb-4"
        />
      </div>
    </div>
  </>
);

export default RequiredFiles;
