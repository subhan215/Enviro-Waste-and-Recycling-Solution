"use client";
import { useState, useEffect } from "react";
import Add_Trucks from "../../components/company_dashboard/Add_Trucks";
import Manage_Areas from "../../components/company_dashboard/Manage_Areas";
import View_Assigned_Areas from "../../components/company_dashboard/View_Assigned_Areas";
import Trucks_Information from "../../components/company_dashboard/Trucks_Information";
import MissedPickups from "../../components/company_dashboard/Missed_Pickups";
import RecyclingCenters from "../../components/company_dashboard/Recycling_Centers";
import AcceptRequests from "../../components/company_dashboard/AcceptRequests";
import Waste_Schedules from "../../components/company_dashboard/Waste_Schedules";
import { setUserData } from "@/store/slices/userDataSlice";
import { useDispatch, useSelector } from "react-redux";
import { setAgreementStatus } from "@/store/slices/agreementStatusSlice";

const CompanyProfilePage = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.userData.value);
  const [selectedOption, setSelectedOption] = useState("manageAreas");
  const [loading, setLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [pendingAgreement, setPendingAgreement] = useState(null); // State to hold pending agreement data
  let contractStatus = useSelector((state) => state.agreementStatus.value) || "active";
  let companyId = userData.user_id;

  useEffect(() => {
    const checkAgreement = async () => {
      setLoading(true); // Start loading when the agreement check begins
      try {
        //const delay = new Promise((resolve) => setTimeout(resolve, 1000));

        const response = await fetch("/api/company/check-agreement", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ company_id: companyId }),
        });

        const data = await response.json();
        //await delay;

        if (data.success) {
          if (data.agreementExists) {
            dispatch(setAgreementStatus("active"));
          } else {
            dispatch(setAgreementStatus("terminated"));
          }
        } else {
          dispatch(setAgreementStatus("terminated"));
        }
      } catch (error) {
        console.error("Error fetching agreement status:", error);
        dispatch(setAgreementStatus("terminated"));
      } finally {
        // Check if both operations (agreement and pending agreement) are done before stopping loading
        if (pendingAgreement !== null) {
          setLoading(false);
        }
      }
    };
    checkAgreement();
  }, [userData, pendingAgreement]); // Dependency on pendingAgreement ensures loading state updates after both operations

  useEffect(() => {
    const fetchPendingAgreement = async () => {
      try {
        const response = await fetch(
          `/api/company/get_pending_resign_agreement/${companyId}`
        );
        const data = await response.json();
        if (data.success) {
          setPendingAgreement(data.data);
        } else {
          setPendingAgreement("No Pending Agreement Found");
        }
      } catch (error) {
        console.error("Error fetching pending agreement:", error);
      }
    };
    if(companyId) {
      fetchPendingAgreement();
    }
   
  }, [contractStatus, companyId]);

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
         setPendingAgreement(data.data)
        // Update the contract status or handle success logic
      } else {
        console.error("Failed to re-sign the agreement");
      }
    } catch (error) {
      console.error("Error signing agreement:", error);
    } finally {
      setIsSigning(false);
    }
  };

  const renderContent = () => {
    if (contractStatus === "terminated") {
      return (
        <div>
          <p>Your contract has been terminated. Please sign the agreement again.</p>
          {pendingAgreement ? 
            <div>
              <h4>Your resign agreement request is in pending!</h4>
            </div>
           : 
          <button
            onClick={handleReSignAgreement}
            disabled={isSigning}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          >
            {isSigning ? "Signing..." : "Re-sign Agreement"}
          </button>  }
        </div>
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
      case "recyclingCenters":
        return <RecyclingCenters />;
      case "requests":
        return <AcceptRequests />;
      case "waste_schedules":
        return <Waste_Schedules />;
      default:
        return <p>Select an option to get started.</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="w-64 bg-white shadow-md p-4">
        <h2 className="text-2xl font-bold mb-6">Company Dashboard</h2>
        {contractStatus === "active" && (
          <ul>
            <li
              className={`py-2 px-4 mb-2 rounded cursor-pointer ${
                selectedOption === "assignTrucks" ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedOption("assignTrucks")}
            >
              Assign Trucks
            </li>
            <li
              className={`py-2 px-4 mb-2 rounded cursor-pointer ${
                selectedOption === "viewAssignedAreas" ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedOption("viewAssignedAreas")}
            >
              View Assigned Areas
            </li>
            <li
              className={`py-2 px-4 mb-2 rounded cursor-pointer ${
                selectedOption === "truckInformation" ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedOption("truckInformation")}
            >
              Truck Information
            </li>
            <li
              className={`py-2 px-4 mb-2 rounded cursor-pointer ${
                selectedOption === "missedPickups" ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedOption("missedPickups")}
            >
              Missed Pickups
            </li>
            <li
              className={`py-2 px-4 mb-2 rounded cursor-pointer ${
                selectedOption === "recyclingCenters" ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedOption("recyclingCenters")}
            >
              Recycling Centers
            </li>
            <li
              className={`py-2 px-4 mb-2 rounded cursor-pointer ${
                selectedOption === "requests" ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedOption("requests")}
            >
              Accept Requests
            </li>
            <li
              className={`py-2 px-4 mb-2 rounded cursor-pointer ${
                selectedOption === "waste_schedules" ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedOption("waste_schedules")}
            >
              Waste Schedules
            </li>
          </ul>
        )}
      </div>

      <div className="flex-grow p-6">{renderContent()}</div>
    </div>
  );
};

export default CompanyProfilePage;
