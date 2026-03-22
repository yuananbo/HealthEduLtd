import React, { useState } from "react";

const FileUpload = ({
  handleChange,
  value,
  id,
  name,
  isRequired = false,
  labelText,
  customClass,
  accept,
}) => {
  const [fileName, setFileName] = useState(value ? value.name : "");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      handleChange(e);
    }
  };

  return (
    <div className={`flex flex-col ${customClass}`}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {labelText}
      </label>
      <label
        htmlFor={id}
        className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md cursor-pointer bg-white text-sm text-gray-900 focus:outline-none focus:ring-greenPrimary focus:border-greenPrimary focus:z-10"
      >
        <span>{fileName ? fileName : "Choose a file"}</span>
        <input
          id={id}
          name={name}
          type="file"
          required={isRequired}
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
        <span className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-gray-500 hover:bg-blueHover hover:text-white">
          Browse
        </span>
      </label>
    </div>
  );
};

export default FileUpload;
