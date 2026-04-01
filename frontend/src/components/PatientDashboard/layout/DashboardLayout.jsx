import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../sidebar/Sidebar";
import { patientRoutes } from "../../../constants/routes";
import Header from "../../Header";
import { SidebarContext } from "../../../context/SidebarContext";

const TherapistDashboardLayout = () => {
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`lg:block fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition-all duration-300 ease-in-out transform bg-gray-800 lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar routes={patientRoutes} />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TherapistDashboardLayout;
