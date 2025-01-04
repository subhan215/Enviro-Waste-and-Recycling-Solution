import { useEffect, useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa"; // Import icons from react-icons
import NoDataDisplay from "../animations/NoDataDisplay";
import Admin_loader from "../ui/Admin_loader"
import Alert from "../ui/Alert";

const AreaApprovalRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Track loading state
  const [alert, setAlert] = useState([]);
  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

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
        showAlert('success' , 'Request approved successfully!')
        fetchRequests(); // Refresh the requests list
      } else {
        showAlert('info' , data.message)
        
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
        showAlert('warning' , 'Request rejected successfully!')
        fetchRequests(); // Refresh the requests list
      } else {
        showAlert('info' , data.message)
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
{alert.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
        />
      ))}    

  {loading ? (
    <Admin_loader />
  ) : requests?.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {requests.map((request) => (
        <div
          key={request.area_approval_id}
          className="relative bg-white rounded-xl shadow-md border border-gray-300 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          {/* Action Icons */}
          <div className="absolute top-1 right-2 flex space-x-2">
            <button
              onClick={() => handleApprove(request.area_approval_id)}
              className="sm:p-1.5 p-1 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
              title="Approve Request"
            >
              <FaCheck className="sm:text-[1rem] text-[0.875rem]" />
            </button>
            <button
              onClick={() => handleReject(request.area_approval_id)}
              className="sm:p-1.5 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
              title="Reject Request"
            >
              <FaTimes className="sm:text-[1rem] text-[0.875rem]" />
            </button>
          </div>

          {/* Card Content */}
          <div className="p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2">
              {request.name}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              <strong>Area ID:</strong> {request.area_id}
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              <strong>Company ID / Name:</strong> {request.company_id} / {request.company_name}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <NoDataDisplay emptyText="No area approval requests found" />
  )}
</div>

  );
};

export default AreaApprovalRequests;
