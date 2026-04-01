import React, { useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SidebarContext } from "../../context/SidebarContext";

const Sidebar = ({ routes }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeSidebar]);

  const handleNavigation = (path) => {
    navigate(path);
    closeSidebar();
  };

  return (
    <div ref={sidebarRef} className="h-full">
      <div className="p-5">
        <h1 className="text-2xl font-bold mb-5 text-white">MobireHab</h1>
        <nav>
          <ul className="space-y-2">
            {routes.map((route, index) => (
              <li key={index}>
                <button
                  onClick={() => handleNavigation(route.path)}
                  className={`block w-full text-left py-2 px-4 rounded transition-all duration-200 ease-in-out ${
                    location.pathname === route.path
                      ? "bg-greenPrimary text-white"
                      : "hover:bg-gray-700 text-white"
                  }`}
                >
                  {route.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
