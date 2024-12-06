import { useEffect, useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa"; // Import icons from react-icons
import { ImSpinner2 } from "react-icons/im"; // Spinner icon for loading
import NoDataDisplay from "../animations/NoDataDisplay";
import Admin_loader from "../ui/Admin_loader"


const AreaApprovalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state

  // Fetch all area approval requests
  const fetchRequests = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetch("/api/admin/get_area_approval_requests");
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching area approval requests:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Function to handle approval
  const handleApprove = async (areaApprovalId) => {
    try {
      const response = await fetch("/api/admin/area_approval_requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ areaApprovalId }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Request approved successfully!");
        fetchRequests(); // Refresh the requests list
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  // Function to handle rejection
  const handleReject = async (areaApprovalId) => {
    try {
      const response = await fetch("/api/admin/area_rejection_requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ areaApprovalId }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Request rejected successfully!");
        fetchRequests(); // Refresh the requests list
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-custom-black">Area Approval Requests</h1>

      {loading ? (
        // Show loading spinner
        <Admin_loader></Admin_loader>
      ) : requests?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div
              key={request.area_approval_id}
              className="relative p-4 bg-white rounded-lg shadow-md border border-gray-300 hover:shadow-lg transition-shadow duration-200"
            >
              {/* Approve and Reject Icons */}
              <div className="absolute top-2 right-2 flex space-x-2">
                <button
                  onClick={() => handleApprove(request.area_approval_id)}
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors duration-200"
                  title="Approve Request"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => handleReject(request.area_approval_id)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  title="Reject Request"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Card Content */}
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                {request.name}
              </h2>
              <p className="text-gray-600">
                <strong>Area ID:</strong> {request.area_id}
              </p>
              <p className="text-gray-600">
                <strong>Company ID / Name: </strong> {request.company_id} /{" "}
                {request.company_name}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <NoDataDisplay emptyText="No area approval requests found"/>
      )}
    </div>
  );
};

export default AreaApprovalRequests;
