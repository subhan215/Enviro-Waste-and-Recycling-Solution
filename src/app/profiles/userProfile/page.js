"use client";
import { useState } from "react";
import ReportMissedPickups from "../../components/user_dashboard/ReportMissedPickups"; // Component for reporting missed pickups
import CreateRequestForRecycledWaste from "../../components/user_dashboard/CreateRequestForRecycledWaste" ; 
const UserProfilePage = () => {
  const [selectedOption, setSelectedOption] = useState("reportMissedPickups");

  // Rendering based on selected option
  const renderContent = () => {
    switch (selectedOption) {
      case "reportMissedPickups":
        return <ReportMissedPickups />;
        case "createRequestForRecycledWaste": 
        return(
          <CreateRequestForRecycledWaste />
        )  ;  
      default:
        return <p>Select an option to get started.</p>;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold mb-6">User Dashboard</h2>
        <ul>
          <li
            className={`py-2 px-4 mb-2 rounded cursor-pointer ${
              selectedOption === "reportMissedPickups" ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedOption("reportMissedPickups")}
          >
            Report Missed Pickups
          </li>
          <li
            className={`py-2 px-4 mb-2 rounded cursor-pointer ${
              selectedOption === "createRequestForRecycledWaste" ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedOption("createRequestForRecycledWaste")}
          >
              Create Request For Recycled Waste
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6">{renderContent()}</div>
    </div>
  );
};

export default UserProfilePage;
