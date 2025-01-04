import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";
import NoDataDisplay from "../animations/NoDataDisplay";
import Alert from '../ui/Alert'
function AcceptRequests() {
    const [requests, setRequests] = useState([]);
    //const [error, setError] = useState("");
    //const [successMessage, setSuccessMessage] = useState("");
    const [newPriceOffered, setNewPriceOffered] = useState("");
    const [loading, setLoading] = useState(true); // New state for loading
    const userData = useSelector((state) => state.userData.value);
    const [alert, setAlert] = useState([]);
    const showAlert = (type, message) => {
      const id = Date.now();
      setAlert([...alert, { id, type, message }]);
      setTimeout(() => {
        setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
      }, 4000);
    };

    useEffect(() => {
        const fetchRequests = async () => {
          setLoading(true); // Start loading
          try {
            const response = await axios.get(
              `/api/requests/get_requests_near_company/${userData.user_id}`
            );
            const fetchedRequests = response.data.requests;
    
            // For each request, fetch the location name based on latitude and longitude
            const requestsWithLocationNames = await Promise.all(
              fetchedRequests.map(async (request) => {
                const locationName = await fetchLocationName(request.latitude, request.longitude);
                return { ...request, locationName };
              })
            );
    
            setRequests(requestsWithLocationNames);
          } catch (err) {
            console.error("Error fetching requests:", err);
            //setError("Error fetching requests");
          } finally {
            setLoading(false); // End loading
          }
        };
    
        // Delay the fetchRequests call by 1 second
        const delayFetchRequests = () => {
          setTimeout(fetchRequests, 1000);
        };
    
        delayFetchRequests();
      }, [userData.user_id]);

    // Function to fetch location name using reverse geocoding API
    const fetchLocationName = async (lat, lon) => {
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );
            return response.data.display_name || "Location not found";
        } catch (err) {
            console.error("Error fetching location name:", err);
            return "Unknown location";
        }
    };

    const handleOfferPrice = async (requestId, oldPrice, newPrice) => {
        console.log("clicked", requestId);
        if (oldPrice && oldPrice < newPrice) {   //This has some issues!
            //alert("Your new offered price should be less than the old one!!!");
            showAlert('error' , 'Your new offered price should be less than the old one!')
            return;
        }
        try {
            const response = await axios.put("/api/requests/offer_price", {
                requestId,
                newPrice,
                company_id: userData.user_id,
            });
            console.log(response);
            if (response.data.success) {
                //setSuccessMessage("Price offered successfully!");
               showAlert('success' , 'Price offered successfully!')
                setRequests((prevRequests) =>
                    prevRequests.map((req) =>
                        req.request_id === requestId ? { ...req, offered_price: newPrice } : req
                    )
                );
            }
        } catch{
            //console.log(err);
            //setError("Failed to offer price");
            showAlert('error' , 'Failed to offer price');
          }
    };
    if (loading) return<><Loader></Loader></>;

    return (
<div className="p-6 rounded-2xl">
  <h2 className="text-xl sm:text-xl md:text-2xl font-bold text-custom-black mb-6">
    Accept Requests
  </h2>

  {alert.map((alert) => (
    <Alert
      key={alert.id}
      type={alert.type}
      message={alert.message}
      onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
    />
  ))}

  {loading ? (
    <p className="text-base sm:text-lg md:text-xl text-center">Loading requests...</p>
  ) : requests.length === 0 ? (
    <>
      <NoDataDisplay emptyText="No requests Found" />
      <p className="text-sm sm:text-base md:text-lg text-center">
        If you haven&apos;t located a recycling center, locate one to see requests for wastes, if any are available.
      </p>
    </>
  ) : (
    <ul className="space-y-4">
      {requests.map((request) => (
        <li
          key={request.request_id}
          className="p-4 bg-white rounded-lg shadow-md border border-custom-green"
        >
          <div className="text-sm sm:text-base font-semibold text-custom-black mb-2">
            Waste Weight: <span className="font-normal">{request.weight}</span>
          </div>
          <div className="text-sm sm:text-base font-semibold text-custom-black mb-2">
            Preferred Date:{" "}
            <span className="font-normal">
              {`${new Date(request.date).getMonth() + 1}/${new Date(
                request.date
              ).getDate()}/${new Date(request.date).getFullYear()}`}
            </span>
          </div>
          <div className="text-sm sm:text-base font-semibold text-custom-black mb-2">
            Preferred Time: <span className="font-normal">{request.time}</span>
          </div>
          <div className="text-sm sm:text-base font-semibold text-custom-black mb-2">
            Location:{" "}
            <span className="font-normal">
              {request.locationName || `${request.latitude}, ${request.longitude}`}
            </span>
          </div>
          <div className="text-sm sm:text-base font-semibold text-custom-black mb-2">
            Distance: <span className="font-normal">{request.distance}</span>
          </div>
          <div className="text-sm sm:text-base font-semibold text-custom-black mb-2">
            Minimum price offered till now:{" "}
            <span className="font-normal">{request.offered_price || " "}</span>
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter your price"
              className="px-4 py-2 w-full rounded-lg border text-sm sm:text-base text-custom-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-black mb-2"
              value={newPriceOffered}
              onChange={(e) => setNewPriceOffered(e.target.value)}
            />
            <button
              onClick={() =>
                handleOfferPrice(request.request_id, request.offered_price, newPriceOffered)
              }
              className="text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 bg-custom-green text-black rounded-lg hover:rounded-2xl transition duration-200 border border-black mt-2"
            >
              Offer Price
            </button>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>

    );
}

export default AcceptRequests;
