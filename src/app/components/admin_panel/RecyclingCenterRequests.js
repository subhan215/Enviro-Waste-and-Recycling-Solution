import { useEffect, useState } from "react";
import { FaCheck, FaTimes } from "react-icons/fa"; // Import Font Awesome icons
import NoDataDisplay from "../animations/NoDataDisplay";

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

            alert(`Request has been ${status}`);
        } catch (err) {
            alert(err.message);
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
                    {requests.map((request, ind) => (
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
                            <div className="p-4">
                                <p className="text-sm text-gray-600">Company ID: {request?.company_id}</p>

                                {/* Material Totals */}
                                <div className="mt-4">
                                    Latitude: {request.latitude}
                                </div>
                                <div className="mt-4">
                                    Longitude: {request.longitude}
                                </div>
                                <div className="mt-4">
                                    Location: {loading ? "loading" : areaNames[ind]}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <NoDataDisplay emptyText="No recycling center requests Found!" />
            )}
        </>
    );
};

export default RecyclingCenterRequests;
