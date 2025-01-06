import { useEffect, useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa"; // Import Font Awesome icons
import NoDataDisplay from "../animations/NoDataDisplay";
import Admin_loader from "../ui/Admin_loader"
import Alert from "../ui/Alert";
// Helper function to fetch requests from the API
const fetchRequests = async () => {
    const response = await fetch("/api/admin/get_recycling_center_requests/");
    if (!response.ok) {
        throw new Error("Failed to fetch requests");
    }
    const data = await response.json();
    return data.data; // Assuming data contains the requests
};

// Helper function to update request status (approve or reject)
const updateRequestStatus = async (requestId, status) => {
    const response = await fetch(`/api/admin/update_recycling_center_request/`, {
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

const RecyclingCenterRequests = () => {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); // State to manage loading
    const [areaNames, setAreaNames] = useState([]);
    const [alert, setAlert] = useState([]);
    const showAlert = (type, message) => {
      const id = Date.now();
      setAlert([...alert, { id, type, message }]);
      setTimeout(() => {
        setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
      }, 4000);
    };
    // Fetch the requests when the component mounts
    useEffect(() => {
        const loadRequests = async () => {
            try {
                const data = await fetchRequests();
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
            showAlert('success' , `Request has been ${status}`)
        } catch (err) {
            showAlert('error' , err.message)
        }
    };

    const fetchAreaName = async (lat, lon) => {
        try {
            // Fetching data from Nominatim API
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );

            // Check if the response is okay (status 200)
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.statusText}`);
            }

            const data = await response.json();

            // Check if the necessary data exists and return the formatted address
            if (data?.address) {
                const { road, neighbourhood, city } = data.address;
                const areaName = `${road || ''} ${neighbourhood || ''} ${city || ''}`.trim() || "Unknown Area";
                return areaName;
            } else {
                return "Unknown Area";
            }
        } catch (error) {
            // Handle any errors that occur during fetch or processing
            console.error("Error fetching area name:", error);
            return "Unknown Area"; // Return a default value in case of error
        }
    };

    useEffect(() => {
        const fetchAllAreaNames = async () => {
            setLoading(true); // Start loading when data fetching begins
            try {
                // Fetch area names for current requests
                const requestAreaNames = await Promise.all(
                    requests.map(async (request) => {
                        const areaName = await fetchAreaName(request.latitude, request.longitude);
                        console.log(areaName)
                        return areaName;
                    })
                );
                setAreaNames(requestAreaNames);
            } catch (error) {
                console.error("Error fetching area names:", error);
            } finally {
                setLoading(false); // Stop loading after data fetching is complete
            }
        };

        if (requests && requests.length > 0) {
            fetchAllAreaNames();
        }
    }, [requests]);

    if (loading) {
        return <Admin_loader></Admin_loader>
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

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
      {requests.map((request , index) => (
        <div
          key={request.area_approval_id}
          className="relative bg-white rounded-xl shadow-md border border-gray-300 transition-transform duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          {/* Action Icons */}
          <div className="absolute top-2 right-2 flex space-x-1.5">
            <button
              onClick={() => handleStatusChange(request.request_id , "Approved")}
              className="p-1.5 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
              title="Approve Request"
            >
              <FaCheck className = "sm:text-[1rem] text-[0.875rem]" />
            </button>
            <button
              onClick={() => handleStatusChange(request.request_id , "Rejected")}
              className="p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
              title="Reject Request"
            >
              <FaTimes className = "sm:text-[1rem] text-[0.875rem]"/>
            </button>
          </div>

          {/* Card Content */}
          <div className="p-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-2">
              {request.name}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              <strong>Area Name:</strong>  {areaNames[index] || 'loading...'}
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              <strong>Company ID / Name:</strong> {request.company_id} / {request.company_name}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <NoDataDisplay emptyText="No recycling center requests found" />
  )}
</div>
    );
};

export default RecyclingCenterRequests;
