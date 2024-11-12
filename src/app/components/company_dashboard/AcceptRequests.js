import React, { useEffect, useState } from "react";
import axios from "axios";

function AcceptRequests() {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [newPriceOffered , setNewPriceOffered] = useState("")
    useEffect(() => {
        // Fetch requests from the database
        const fetchRequests = async () => {
            try {
                const company_id = 1; // Replace with the actual company_id you want to test
                const response = await axios.get(`/api/requests/get_requests_near_company/${company_id}`);
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
                console.error('Error fetching requests:', err);
                setError("Error fetching requests");
            }
        };

        fetchRequests();
    }, []);

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

    const handleOfferPrice = async (requestId, oldPrice,  newPrice) => {
        console.log("clicked" , requestId) 
        if(oldPrice && oldPrice <newPrice) {
            alert("Your new offered price should be less than the old one!!!") ; 
            return  ; 
        }
        try {
            const response = await axios.put("/api/requests/offer_price", { requestId, newPrice , company_id:3 });
            console.log(response)
            if (response.data.success) {
                setSuccessMessage("Price offered successfully!");
                setRequests((prevRequests) =>
                    prevRequests.map((req) =>
                        req.request_id === requestId ? { ...req, offered_price: newPrice } : req
                    )
                );
            }
        } catch (err) {
            console.log(err) ; 
            setError("Failed to offer price");
        }
    };

    return (
        <div>
            <h2>Accept Requests</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

            <ul>
                {requests.map((request) => (
                    <li key={request.request_id} className="request-item">
                        <p>Waste Weight: {request.weight}</p>
                        <p>Preferred Date: {request.date}</p>
                        <p>Preferred Time: {request.time}</p>
                        <p>Location: {request.locationName || `${request.latitude}, ${request.longitude}`}</p>
                        <p>Distance: {request.distance}</p>

                        <p>
                            Minimum price offered till now:{request.offered_price ? request.offered_price : " "}
                                <div>
                                <input
                                    type="number"
                                    placeholder="Enter your price"
                                    onChange={(e) =>
                                        setNewPriceOffered(e.target.value)
                                    }
                                />
                                <button onClick={() => handleOfferPrice( request.request_id, request.offered_price,  newPriceOffered)}>Offer Price</button>
                                </div>
                               
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AcceptRequests;
