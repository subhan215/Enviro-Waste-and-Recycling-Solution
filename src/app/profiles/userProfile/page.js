"use client";
import { useState } from "react";
import ReportMissedPickups from "../../components/user_dashboard/ReportMissedPickups"; // Component for reporting missed pickups
import CreateRequestForRecycledWaste from "../../components/user_dashboard/CreateRequestForRecycledWaste";
import Waste_Pickup_Schedules from "../../components/user_dashboard/User_Schedules";
import Report_to_admin from "../../components/user_dashboard/Report_to_admin";
import LocateRecyclingCenters from "../../components/user_dashboard/LocateRecyclingCenters"
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
      case "locate_recycling_centers": 
        return <LocateRecyclingCenters />
      default:
        return <p>Select an option to get started.</p>;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-200">
      {/* Sidebar */}
      <div className="w-66 bg-white shadow-md p-0 border-2 ">
      <h2 className="text-2xl font-bold mb-6 pt-2 ml-2">User Dashboard</h2>
        <ul>
          <li
            className={`flex items-center py-2 px-4 mb-2 cursor-pointer ${
              selectedOption === "reportMissedPickups"
                  ? "bg-custom-green text-custom-black "
                  : ""
            }`}
            onClick={() => setSelectedOption("reportMissedPickups")}
          >
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
</svg>

              &nbsp;            
            Report Missed Pickup
          </li>

          <li
            className={`flex items-center py-2 px-4 mb-2 cursor-pointer ${
              selectedOption === "createRequestForRecycledWaste"
                  ? "bg-custom-green text-custom-black "
                  : ""
            }`}
            onClick={() => setSelectedOption("createRequestForRecycledWaste")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>
&nbsp; 
            Requests For Recycled Waste
          </li>
          <li
            className={`flex items-center py-2 px-4 mb-2 cursor-pointer ${
              selectedOption === "waste_pickup_schedules"
                  ? "bg-custom-green text-custom-black "
                  : ""
            }`}
            onClick={() => setSelectedOption("waste_pickup_schedules")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
</svg>
 &nbsp;
            Waste Pickup Schedules
          </li>
          <li
            className={`flex items-center py-2 px-4 mb-2 cursor-pointer ${
              selectedOption === "report_to_admin"
                  ? "bg-custom-green text-custom-black "
                  : ""
            }`}
            onClick={() => setSelectedOption("report_to_admin")}
          >
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
</svg>
&nbsp;
            Report to Admin
          </li>
          <li
            className={`flex items-center py-2 px-4 mb-2 cursor-pointer ${
              selectedOption === "locate_recycling_centers"
                  ? "bg-custom-green text-custom-black "
                  : ""
            }`}
            onClick={() => setSelectedOption("locate_recycling_centers")}
          >
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
</svg>
&nbsp;
            Locate Recycling Centers
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6">{renderContent()}</div>
    </div>
  );
};

export default UserProfilePage;
