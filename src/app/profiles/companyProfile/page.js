"use client";
import { useState, useEffect, lazy } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAgreementStatus } from "@/store/slices/agreementStatusSlice";
import { Truck, MapPin, IdCard, AlertTriangle, Construction, Globe, CheckSquare, Calendar, Package } from "lucide-react";
import Loader from "../../components/ui/Loader";
import { DashboardLayout, SidebarItem, PageHeader } from "../../components/layouts/DashboardLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

const Add_Trucks = lazy(() => import("../../components/company_dashboard/Add_Trucks"));
const View_Assigned_Areas = lazy(() => import("../../components/company_dashboard/View_Assigned_Areas"));
const Trucks_Information = lazy(() => import("../../components/company_dashboard/Trucks_Information"));
const MissedPickups = lazy(() => import("../../components/company_dashboard/Missed_Pickups"));
const ManholeReports = lazy(() => import("../../components/company_dashboard/Manhole_Reports"));
const RecyclingCenters = lazy(() => import("../../components/company_dashboard/Recycling_Centers"));
const AcceptRequests = lazy(() => import("../../components/company_dashboard/AcceptRequests"));
const Waste_Schedules = lazy(() => import("../../components/company_dashboard/Waste_Schedules"));
const SubmitUserMaterials = lazy(() => import("../../components/company_dashboard/SubmitUserMaterials"));

const CompanyProfilePage = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.userData.value);
  const [selectedOption, setSelectedOption] = useState("viewAssignedAreas");
  const [loading, setLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [pendingAgreement, setPendingAgreement] = useState(null);
  const [agreementChecked, setAgreementChecked] = useState(false);

  let contractStatus = useSelector((state) => state.agreementStatus.value) || "active";
  let companyId = userData.user_id;

  useEffect(() => {
    const checkAgreement = async () => {
      try {
        const response = await fetch("/api/company/check-agreement", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ company_id: companyId }),
        });
        const data = await response.json();
        if (data.success && data.agreementExists) {
          dispatch(setAgreementStatus("active"));
        } else {
          dispatch(setAgreementStatus("terminated"));
        }
      } catch (error) {
        console.error("Error fetching agreement status:", error);
        dispatch(setAgreementStatus("terminated"));
      } finally {
        setAgreementChecked(true);
      }
    };

    if (companyId) {
      checkAgreement();
    }
  }, [companyId, dispatch]);

  useEffect(() => {
    const fetchPendingAgreement = async () => {
      try {
        const response = await fetch(`/api/company/get_pending_resign_agreement/${companyId}`);
        const data = await response.json();
        setPendingAgreement(data.data?.length > 0 ? data.data : null);
      } catch (error) {
        console.error("Error fetching pending agreement:", error);
      }
    };

    if (companyId) {
      fetchPendingAgreement();
    }
  }, [companyId]);

  useEffect(() => {
    if (agreementChecked) {
      setLoading(false);
    }
  }, [agreementChecked]);

  const handleReSignAgreement = async () => {
    setIsSigning(true);
    try {
      const response = await fetch("/api/company/resign-agreement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company_id: companyId }),
      });

      const data = await response.json();
      if (data.success) {
        setPendingAgreement(data.data);
      } else {
        console.error("Failed to re-sign the agreement");
      }
    } catch (error) {
      console.error("Error signing agreement:", error);
    } finally {
      setIsSigning(false);
    }
  };

  const menuItems = [
    { id: "assignTrucks", label: "Assign Trucks", icon: <Truck className="w-5 h-5" /> },
    { id: "viewAssignedAreas", label: "Assigned Areas", icon: <MapPin className="w-5 h-5" /> },
    { id: "truckInformation", label: "Truck Information", icon: <IdCard className="w-5 h-5" /> },
    { id: "missedPickups", label: "Missed Pickups", icon: <AlertTriangle className="w-5 h-5" /> },
    { id: "manholeReports", label: "Manhole Reports", icon: <Construction className="w-5 h-5" />, variant: "warning" },
    { id: "recyclingCenters", label: "Recycling Centers", icon: <Globe className="w-5 h-5" /> },
    { id: "requests", label: "Accept Requests", icon: <CheckSquare className="w-5 h-5" /> },
    { id: "waste_schedules", label: "Waste Schedules", icon: <Calendar className="w-5 h-5" /> },
    { id: "submit_materials", label: "Submit Materials", icon: <Package className="w-5 h-5" /> },
  ];

  const getPageInfo = () => {
    switch (selectedOption) {
      case "assignTrucks":
        return { title: "Assign Trucks", subtitle: "Assign trucks to service areas" };
      case "viewAssignedAreas":
        return { title: "Assigned Areas", subtitle: "View and manage your assigned service areas" };
      case "truckInformation":
        return { title: "Truck Information", subtitle: "View details about your fleet" };
      case "missedPickups":
        return { title: "Missed Pickups", subtitle: "Handle reported missed pickups" };
      case "manholeReports":
        return { title: "Manhole Reports", subtitle: "View and resolve manhole issues" };
      case "recyclingCenters":
        return { title: "Recycling Centers", subtitle: "Manage your recycling center locations" };
      case "requests":
        return { title: "Accept Requests", subtitle: "Review and accept service requests" };
      case "waste_schedules":
        return { title: "Waste Schedules", subtitle: "Manage waste collection schedules" };
      case "submit_materials":
        return { title: "Submit Materials", subtitle: "Submit collected materials from users" };
      default:
        return { title: "Dashboard", subtitle: "Select an option to get started" };
    }
  };

  const renderContent = () => {
    if (contractStatus === "terminated") {
      return (
        <Card className="max-w-lg mx-auto">
          <CardContent className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-warning" />
            </div>
            {!pendingAgreement ? (
              <>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Contract Terminated
                </h3>
                <p className="text-text-secondary mb-6">
                  Your contract has been terminated. Please sign the agreement again to continue.
                </p>
                <Button
                  onClick={handleReSignAgreement}
                  disabled={isSigning}
                  loading={isSigning}
                >
                  {isSigning ? "Signing..." : "Re-sign Agreement"}
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Agreement Pending
                </h3>
                <p className="text-text-secondary">
                  Your resign agreement request is pending approval.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      );
    }

    switch (selectedOption) {
      case "assignTrucks":
        return <Add_Trucks />;
      case "viewAssignedAreas":
        return <View_Assigned_Areas />;
      case "truckInformation":
        return <Trucks_Information />;
      case "missedPickups":
        return <MissedPickups />;
      case "manholeReports":
        return <ManholeReports />;
      case "recyclingCenters":
        return <RecyclingCenters />;
      case "requests":
        return <AcceptRequests />;
      case "waste_schedules":
        return <Waste_Schedules />;
      case "submit_materials":
        return <SubmitUserMaterials />;
      default:
        return <p className="text-text-secondary">Select an option to get started.</p>;
    }
  };

  if (loading) {
    return <Loader />;
  }

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
    <DashboardLayout sidebar={sidebar} title="Company Dashboard">
      <PageHeader title={pageInfo.title} subtitle={pageInfo.subtitle} />
      {renderContent()}
    </DashboardLayout>
  );
};

export default CompanyProfilePage;
