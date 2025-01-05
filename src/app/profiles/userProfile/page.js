"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

const ReportMissedPickups = dynamic(() =>
  import("../../components/user_dashboard/ReportMissedPickups")
);
const CreateRequestForRecycledWaste = dynamic(() =>
  import("../../components/user_dashboard/CreateRequestForRecycledWaste")
);
const Waste_Pickup_Schedules = dynamic(() =>
  import("../../components/user_dashboard/User_Schedules")
);
const Report_to_admin = dynamic(() =>
  import("../../components/user_dashboard/Report_to_admin")
);
const LocateRecyclingCenters = dynamic(() =>
  import("../../components/user_dashboard/LocateRecyclingCenters")
);

const UserProfilePage = () => {
  const [selectedOption, setSelectedOption] = useState("reportMissedPickups");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderContent = () => {
    switch (selectedOption) {
      case "reportMissedPickups":
        return <ReportMissedPickups />;
      case "createRequestForRecycledWaste":
        return <CreateRequestForRecycledWaste />;
      case "waste_pickup_schedules":
        return <Waste_Pickup_Schedules />;
      case "report_to_admin":
        return <Report_to_admin />;
      case "locate_recycling_centers":
        return <LocateRecyclingCenters />;
      default:
        return <p>Select an option to get started.</p>;
    }
  };

  return (
    <div className="flex bg-green-50 relative w-screen h-screen">
  {/* Sidebar */}
  <div
    className={`absolute top-0 left-0 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
      isSidebarOpen ? "translate-x-0" : "-translate-x-full"
    }`}
    style={{ minWidth: "250px", borderRight: "1px solid black", zIndex: 9999 }}
  >
    <div className="flex justify-between items-center p-4 border-b">
      <h2 className="text-xl font-bold text-custom-black">User Dashboard</h2>
      <button
        onClick={toggleSidebar}
        className="text-xl font-bold text-custom-green md:hidden"
      >
        &times;
      </button>
    </div>
    <ul>
      <li
        className={`flex items-center py-2 px-4 w-full mb-2 text-custom-black cursor-pointer ${
          selectedOption === "reportMissedPickups" ? "bg-custom-green text-custom-black font-semibold"
                  : "hover:bg-custom-green"
        }`}
        onClick={() => setSelectedOption("reportMissedPickups")}
      >
        Report Missed Pickup
      </li>
      <li
        className={`flex items-center py-2 px-4 mb-2 cursor-pointer text-custom-black ${
          selectedOption === "createRequestForRecycledWaste" ? "bg-custom-green text-custom-black font-semibold"
                  : "hover:bg-custom-green"
        }`}
        onClick={() => setSelectedOption("createRequestForRecycledWaste")}
      >
        Requests For Recycled Waste
      </li>
      <li
        className={`flex items-center py-2 px-4 mb-2 cursor-pointer text-custom-black ${
          selectedOption === "waste_pickup_schedules" ? "bg-custom-green text-custom-black font-semibold"
                  : "hover:bg-custom-green"
        }`}
        onClick={() => setSelectedOption("waste_pickup_schedules")}
      >
        Waste Pickup Schedules
      </li>
      <li
        className={`flex items-center py-2 px-4 mb-2 cursor-pointer text-custom-black ${
          selectedOption === "report_to_admin" ? "bg-custom-green text-custom-black font-semibold"
                  : "hover:bg-custom-green"
        }`}
        onClick={() => setSelectedOption("report_to_admin")}
      >
        Report to Admin
      </li>
      <li
        className={`flex items-center py-2 px-4 mb-2 cursor-pointer text-custom-black ${
          selectedOption === "locate_recycling_centers" ? "bg-custom-green text-custom-black font-semibold"
                  : "hover:bg-custom-green"
        }`}
        onClick={() => setSelectedOption("locate_recycling_centers")}
      >
        Locate Recycling Centers
      </li>
    </ul>
  </div>

  {/* Sidebar Toggle Button */}
  <button
    onClick={toggleSidebar}
    className={`fixed z-30 left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-custom-green text-white flex items-center justify-center rounded-r-full shadow-lg md:hidden ${
      isSidebarOpen ? "hidden" : "block"
    }`}
  >
    →
  </button>

  {/* Main Content */}
  <div
    className={`p-6 transition-all duration-300 ease-in-out flex-1 overflow-y-auto`}
  >
    {renderContent()}
  </div>
</div>

  );
};

export default UserProfilePage;
