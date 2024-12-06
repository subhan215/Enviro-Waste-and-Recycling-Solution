import { useEffect, useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa"; // Import Font Awesome icons
import NoDataHappyFace from "../animations/noDataHappyFace";
import NoDataDisplay from "../animations/NoDataDisplay";

// Helper function to fetch requests from the API
const fetchRequests = async () => {
  const response = await fetch("/api/admin/get_request_submit_materials/");
  if (!response.ok) {
    throw new Error("Failed to fetch requests");
  }
  const data = await response.json();
  return data.data; // Assuming data contains the requests
};

// Helper function to update request status (approve or reject)
const updateRequestStatus = async (requestId, status) => {
  const response = await fetch(`/api/admin/updateRequestStatus/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      request_id: requestId,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update request status");
  }
  return response.json();
};

const SubmitMaterialRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // State to manage loading

  // Fetch the requests when the component mounts
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await fetchRequests();
        console.log(data)
        setRequests(data); // Assuming 'requests' contains the requests data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };
    loadRequests();
  }, []);

  // Handle the approve or reject action
  const handleStatusChange = async (requestId, status) => {
    try {
      const updatedRequest = await updateRequestStatus(requestId, status);
      console.log(updatedRequest);
  
      // Remove the request from the list after status update
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.request_id !== requestId)
      );
  
      alert(`Request has been ${status}`);
    } catch (err) {
      alert(err.message);
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner-border animate-spin inline-block w-16 h-16 border-4 border-solid rounded-full border-gray-600 border-t-transparent" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {requests.length > 0 ? (
        <div className="submit-material-requests grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6">
          {requests?.map((request) => (
            <div
              key={request?.request_id}
              className="card bg-white shadow-lg rounded-lg overflow-hidden border relative"
            >
              {/* Position the buttons at the top right corner */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  className="bg-green-500 text-white p-2 rounded-full"
                  onClick={() => handleStatusChange(request?.request_id, "Approved")}
                >
                  <FaCheck />
                </button>
                <button
                  className="bg-red-500 text-white p-2 rounded-full"
                  onClick={() => handleStatusChange(request?.request_id, "Rejected")}
                >
                  <FaTimes />
                </button>
              </div>
  
              {/* Image positioned below the buttons */}
              <img
                src={request?.image_url}
                alt="Request Image"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-gray-600">Company ID: {request?.company_id}</p>
                <p className="text-sm text-gray-600">User ID: {request?.user_id}</p>
                <p className="mt-2 text-sm">Status: {request?.status}</p>
  
                {/* Material Totals */}
                <div className="mt-4">
                  <div className="text-lg font-semibold">Material Totals:</div>
                  <div className="mt-2">
                    <div className="total-item">
                      <span className="text-md text-gray-500">Paper/Cardboard:</span>
                      <span className="text-md ml-3">{request?.paper_cardboard_total}</span>
                    </div>
                    <div className="total-item">
                      <span className="text-md text-gray-500">Plastics:</span>
                      <span className="text-md ml-3">{request?.plastics_total}</span>
                    </div>
                    <div className="total-item">
                      <span className="text-md text-gray-500">Metals:</span>
                      <span className="ml-3 text-md">{request?.metals_total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <NoDataDisplay emptyText="No submit material requests Found!" />
      )}
    </>
  );
  
};

export default SubmitMaterialRequests;
