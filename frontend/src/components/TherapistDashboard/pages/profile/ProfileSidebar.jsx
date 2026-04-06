import React from "react";

const ProfileSidebar = ({ activeTab, setActiveTab, therapist }) => {
  const tabs = ["personal", "professional", "security", "ratings"];

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="text-center mb-8">
          {therapist.profilePicture &&
          typeof therapist.profilePicture === "string" &&
          therapist.profilePicture.trim() ? (
            <img
              src={therapist.profilePicture}
              alt="Profile"
              className="w-32 h-32 rounded-full mx-auto border-4 border-blue-500 object-cover shadow-lg"
            />
          ) : (
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-blue-500 bg-blue-100 text-3xl font-bold text-blue-700 shadow-lg">
              {therapist.firstName?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <h2 className="mt-4 text-2xl font-bold text-gray-800">
            {`${therapist.firstName} ${therapist.lastName}`}
          </h2>
          <p className="text-blue-600">{therapist.specialization}</p>
        </div>
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`w-full text-left py-2 px-4 rounded-lg transition-colors ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-blue-100"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ProfileSidebar;
