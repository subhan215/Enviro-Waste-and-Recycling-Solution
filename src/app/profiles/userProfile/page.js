"use client";
import { useState } from "react";
import ReportMissedPickups from "../../components/user_dashboard/ReportMissedPickups"; // Component for reporting missed pickups
import CreateRequestForRecycledWaste from "../../components/user_dashboard/CreateRequestForRecycledWaste";
import Waste_Pickup_Schedules from "../../components/user_dashboard/User_Schedules";
import Report_to_admin from "../../components/user_dashboard/Report_to_admin";
const UserProfilePage = () => {
  const [selectedOption, setSelectedOption] = useState("reportMissedPickups");

  // Rendering based on selected option
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
      default:
        return <p>Select an option to get started.</p>;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-200">
      {/* Sidebar */}
      <div className="w-64 bg-custom-green shadow-md p-4 border-2 border-black rounded-md mt-2">
        <h2 className="text-2xl font-bold mb-6 ">User Dashboard</h2>
        <ul>
          <li
            className={`py-2 px-4 mb-2 rounded-lg cursor-pointer ${
              selectedOption === "reportMissedPickups"
                ? "bg-white text-black border-2 border-black hover:rounded-2xl"
                : "hover:rounded-2xl"
            }`}
            onClick={() => setSelectedOption("reportMissedPickups")}
          >
            Report Missed Pickup
          </li>

          <li
            className={`py-2 px-4 mb-2 rounded cursor-pointer ${
              selectedOption === "createRequestForRecycledWaste"
                ? "bg-white text-black border-2 border-black hover:rounded-2xl"
                : "hover:rounded-2xl"
            }`}
            onClick={() => setSelectedOption("createRequestForRecycledWaste")}
          >
            Requests For Recycled Waste
          </li>
          <li
            className={`py-2 px-4 mb-2 rounded cursor-pointer ${
              selectedOption === "waste_pickup_schedules"
                ? "bg-white text-black border-2 border-black hover:rounded-2xl"
                : "hover:rounded-2xl"
            }`}
            onClick={() => setSelectedOption("waste_pickup_schedules")}
          >
            Waste Pickup Schedules
          </li>
          <li
            className={`py-2 px-4 mb-2 rounded cursor-pointer ${
              selectedOption === "report_to_admin"
                ? "bg-white text-black border-2 border-black hover:rounded-2xl"
                : "hover:rounded-2xl"
            }`}
            onClick={() => setSelectedOption("report_to_admin")}
          >
            Report to Admin
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6">{renderContent()}</div>
    </div>
  );
};

export default UserProfilePage;
