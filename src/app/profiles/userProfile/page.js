"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, Construction, Recycle, Calendar, MessageSquare, MapPin } from "lucide-react";
import { DashboardLayout, SidebarItem, PageHeader } from "../../components/layouts/DashboardLayout";

const ReportMissedPickups = dynamic(() =>
  import("../../components/user_dashboard/ReportMissedPickups")
);
const ReportManhole = dynamic(() =>
  import("../../components/user_dashboard/ReportManhole")
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

  const menuItems = [
    { id: "reportMissedPickups", label: "Report Missed Pickup", icon: <AlertTriangle className="w-5 h-5" /> },
    { id: "reportManhole", label: "Report Manhole Issue", icon: <Construction className="w-5 h-5" />, variant: "warning" },
    { id: "createRequestForRecycledWaste", label: "Recycled Waste Requests", icon: <Recycle className="w-5 h-5" /> },
    { id: "waste_pickup_schedules", label: "Pickup Schedules", icon: <Calendar className="w-5 h-5" /> },
    { id: "report_to_admin", label: "Report to Admin", icon: <MessageSquare className="w-5 h-5" /> },
    { id: "locate_recycling_centers", label: "Recycling Centers", icon: <MapPin className="w-5 h-5" /> },
  ];

  const getPageInfo = () => {
    switch (selectedOption) {
      case "reportMissedPickups":
        return { title: "Report Missed Pickup", subtitle: "Submit a report for missed waste collection" };
      case "reportManhole":
        return { title: "Report Manhole Issue", subtitle: "Report manhole problems in your area" };
      case "createRequestForRecycledWaste":
        return { title: "Recycled Waste Requests", subtitle: "Request recycled waste collection" };
      case "waste_pickup_schedules":
        return { title: "Pickup Schedules", subtitle: "View your waste pickup schedule" };
      case "report_to_admin":
        return { title: "Report to Admin", subtitle: "Send a message to the administrator" };
      case "locate_recycling_centers":
        return { title: "Recycling Centers", subtitle: "Find recycling centers near you" };
      default:
        return { title: "Dashboard", subtitle: "Select an option to get started" };
    }
  };

  const renderContent = () => {
    switch (selectedOption) {
      case "reportMissedPickups":
        return <ReportMissedPickups />;
      case "reportManhole":
        return <ReportManhole />;
      case "createRequestForRecycledWaste":
        return <CreateRequestForRecycledWaste />;
      case "waste_pickup_schedules":
        return <Waste_Pickup_Schedules />;
      case "report_to_admin":
        return <Report_to_admin />;
      case "locate_recycling_centers":
        return <LocateRecyclingCenters />;
      default:
        return <p className="text-text-secondary">Select an option to get started.</p>;
    }
  };

  const sidebar = (
    <div className="space-y-1">
      {menuItems.map((item) => (
        <SidebarItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={selectedOption === item.id}
          onClick={() => setSelectedOption(item.id)}
          variant={item.variant || "default"}
        />
      ))}
    </div>
  );

  const pageInfo = getPageInfo();

  return (
    <DashboardLayout sidebar={sidebar} title="User Dashboard">
      <PageHeader title={pageInfo.title} subtitle={pageInfo.subtitle} />
      {renderContent()}
    </DashboardLayout>
  );
};

export default UserProfilePage;
