import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const useMapEvents = dynamic(
  () => import("react-leaflet").then((mod) => mod.useMapEvents),
  { ssr: false }
);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function CreateRequestForRecycledWaste() {
  const userData = useSelector((state) => state.userData.value);
  console.log(userData);
  const [waste, setWaste] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [map, setMap] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentRequest, setCurrentRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState({
    latitude: "",
    longitude: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/api/requests/request_for_recycled_waste",
        {
          waste,
          preferredDate,
          preferredTime,
          latitude: requestData.latitude,
          longitude: requestData.longitude,
          userId: userData.user_id, // Replace with dynamic user ID as needed
        }
      );

      if (response.data.success) {
        setSuccessMessage("Request submitted successfully!");
        alert("Request submitted successfully!");
        setWaste("");
        setPreferredDate("");
        setPreferredTime("");
        setLocationName("");
        setRequestData({ latitude: "", longitude: "" });
        fetchCurrentRequest();
      }
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setRequestData({ latitude: lat, longitude: lng });
      },
    });

    return requestData.latitude && requestData.longitude ? (
      <Marker position={[requestData.latitude, requestData.longitude]} />
    ) : null;
  };

  const handleSearchLocation = async () => {
    const karachiBounds = {
      southWest: { lat: 24.774265, lon: 66.973096 },
      northEast: { lat: 25.102974, lon: 67.192733 },
    };

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          locationName
        )}&format=json&bounded=1&viewbox=${karachiBounds.northEast.lon},${
          karachiBounds.northEast.lat
        },${karachiBounds.southWest.lon},${karachiBounds.southWest.lat}`
      );

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setRequestData({ latitude: lat, longitude: lon });

        if (map) {
          map.setView([lat, lon], 14);
        }
      } else {
        setError("Location not found");
      }
    } catch {
      setError("Error searching for location");
    }
  };
  const fetchCurrentRequest = async () => {
    try {
      const response = await axios.get(
        `/api/requests/request_for_recycled_waste/${userData.user_id}`
      ); // Replace '2' with dynamic user ID as needed
      setCurrentRequest(response.data.requests[0]);
      console.log(response);
      console.log("Current request set: ", currentRequest);
    } catch (err) {
      //setError('Failed to fetch current request');
      console.log(err);
    }
  };
  useEffect(() => {
    const fetchcurrentrequest = async () => {
      setLoading(true);
      try {
        await fetchCurrentRequest(); // Assuming this is a function that fetches the current request
      } catch (error) {
        console.error('Error fetching current request:', error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000); // Delay for 5 seconds
      }
    };

    fetchcurrentrequest();
  }, []);
  
  const deleteRequest = async (requestId) => {
    try {
      console.log(`Attempting to delete request with ID: ${requestId}`);
      const response = await axios.delete(
        `/api/requests/delete_request/${requestId}`
      );

      console.log("Response:", response);

      if (response.data.success) {
        setCurrentRequest(null);
        alert(response.data.message);
      } else {
        // Handle case where the server responded but with an issue (e.g., no success flag)
        console.error("Delete operation failed:", response.data);
        setError("Delete operation did not succeed.");
        alert(
          response.data.message ||
            "An error occurred while deleting the request."
        );
      }
    } catch (err) {
      // Detailed error logging
      console.error("Error occurred during delete request:", err);

      if (err.response) {
        // Server responded with a status other than 2xx
        console.error("Error Response Data:", err.response.data);
        console.error("Error Response Status:", err.response.status);
        console.error("Error Response Headers:", err.response.headers);
        setError(err.response.data.message || "Failed to delete the request");
        alert(
          `Error: ${
            err.response.data.message || "Failed to delete the request"
          }`
        );
      } else if (err.request) {
        // Request was made but no response received
        console.error("No response received:", err.request);
        setError("No response from the server.");
        alert("No response received from the server.");
      } else {
        // Other unexpected errors
        console.error("Error Message:", err.message);
        setError("Unexpected error occurred.");
        alert(`Error: ${err.message}`);
      }
    }
  };
  const acceptOffer = async (requestId) => {
    try {
      // Send POST request with requestId in the body
      const response = await axios.post("/api/requests/accept_Offer", {
        requestId,
      });

      // Handle response
      if (response.status === 201) {
        alert(response.data.message); // Success message
        //currentRequest(null)
        alert("See schedule tab.A new schedule has been created!");
        setCurrentRequest(null);
        await fetchCurrentRequest();
        // Optionally update the UI state, e.g., reset the current request or show the schedule
      } else {
        alert(response.data.message); // Error message if status is not 201
      }
    } catch (error) {
      console.error("Error accepting the offer:", error);
      alert("Failed to accept the offer, please try again.");
    }
  };
  if (loading) return <Loader></Loader>;
  return (
    // <div> {!currentRequest ? <div>
    //     <h2>Create Request for Recycled Waste</h2>
    //     <form onSubmit={handleSubmit}>
    //         <div>
    //             <label htmlFor="waste">Waste Weight:</label>
    //             <input
    //                 type="text"
    //                 id="waste"
    //                 value={waste}
    //                 onChange={(e) => setWaste(e.target.value)}
    //                 required
    //             />
    //         </div>
    //         <div>
    //             <label htmlFor="preferredDate">Preferred Date:</label>
    //             <input
    //                 type="date"
    //                 id="preferredDate"
    //                 value={preferredDate}
    //                 onChange={(e) => setPreferredDate(e.target.value)}
    //                 required
    //             />
    //         </div>
    //         <div>
    //             <label htmlFor="preferredTime">Preferred Time:</label>
    //             <input
    //                 type="time"
    //                 id="preferredTime"
    //                 value={preferredTime}
    //                 onChange={(e) => setPreferredTime(e.target.value)}
    //                 required
    //             />
    //         </div>
    //         <button type="submit">Create Request</button>
    //         {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    //         {error && <p style={{ color: 'red' }}>{error}</p>}

    //         <h3>Search Location</h3>
    //         <input
    //             type="text"
    //             value={locationName}
    //             onChange={(e) => setLocationName(e.target.value)}
    //             placeholder="Enter location name"
    //         />
    //         <button type="button" onClick={handleSearchLocation}>Search</button>

    //         <h3>Select Location on Map</h3>
    //         <MapContainer
    //             center={[24.8607, 67.0011]}
    //             zoom={12}
    //             style={{ height: '400px', width: '100%' }}
    //             whenCreated={setMap}
    //         >
    //             <TileLayer
    //                 url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
    //                 attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    //             />
    //             <LocationMarker />
    //         </MapContainer>
    //     </form>
    //     </div> : <div>
    //     <h3>Request Details</h3>
    //     <ul>
    //         {currentRequest.request_id && <li><strong>Request ID:</strong> {currentRequest.request_id}</li>}
    //         {currentRequest.user_id && <li><strong>User ID:</strong> {currentRequest.user_id}</li>}
    //         {currentRequest.weight && <li><strong>Weight:</strong> {currentRequest.weight} kg</li>}
    //         {currentRequest.latitude && <li><strong>Latitude:</strong> {currentRequest.latitude}</li>}
    //         {currentRequest.longitude && <li><strong>Longitude:</strong> {currentRequest.longitude}</li>}
    //         {currentRequest.date && <li><strong>Date:</strong> {currentRequest.date}</li>}
    //         {currentRequest.time && <li><strong>Time:</strong> {currentRequest.time}</li>}
    //         {currentRequest.offered_price && <li><strong>Offered Price:</strong> {currentRequest.offered_price}</li>}
    //         {currentRequest.offered_by && <li><strong>Offered By:</strong> {currentRequest.offered_by}</li>}
    //     </ul>
    //     <button onClick={()=> acceptOffer(currentRequest.request_id)}>
    //         Accept
    //     </button>
    //     <button onClick={()=> deleteRequest(currentRequest.request_id)}>Delete</button>
    // </div>}

    // </div>
    <div className="container mx-auto px-4 py-8 ">
      {!currentRequest ? (
        <div className="bg-white p-8 shadow-lg rounded-lg border-2 border-black">
          <h2 className="text-3xl font-bold text-black  p-2 mb-6 rounded">
            Create Request for Recycled Waste
          </h2>

          <form
            onSubmit={handleSubmit}
            //className="border-4 border-custom-green p-4 rounded-lg"
          >
            <div className="mb-4">
              <label
                htmlFor="waste"
                className="block text-lg font-semibold text-black mb-2"
              >
                Waste Weight:
              </label>
              <input
                type="text"
                id="waste"
                value={waste}
                onChange={(e) => setWaste(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="preferredDate"
                className="block text-lg font-semibold text-black mb-2"
              >
                Preferred Date:
              </label>
              <input
                type="date"
                id="preferredDate"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="preferredTime"
                className="block text-lg font-semibold text-black mb-2"
              >
                Preferred Time:
              </label>
              <input
                type="time"
                id="preferredTime"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="bg-custom-green text-black py-2 px-4 rounded-lg font-bold border border-black hover:bg-custom-green transition duration-300 hover:rounded-2xl"
            >
              Create Request
            </button>
            {successMessage && (
              <p className="text-custom-green mt-4">{successMessage}</p>
            )}
            {error && <p className="text-red-500 mt-4">{error}</p>}
            <h3 className="text-xl font-bold mt-6 mb-2 text-black hover:rounded-2xl ">
              Search Location
            </h3>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Enter location name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <button
              type="button"
              onClick={handleSearchLocation}
              className="bg-custom-green text-black py-2 px-4 rounded-lg font-bold border border-black hover:bg-custom-green transition duration-300 mb-6 hover:rounded-2xl"
            >
              Search
            </button>
            <h3 className="text-xl font-bold mb-4 text-black">
              Select Location on Map
            </h3>
            <MapContainer
              center={[24.8607, 67.0011]}
              zoom={12}
              style={{ height: "400px", width: "100%" }}
              whenCreated={setMap}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              <LocationMarker />
            </MapContainer>
          </form>
        </div>
      ) : (
        <div className="bg-white p-8 shadow-lg rounded-lg max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-black mb-6">
            Request Details: 
          </h3>

          <ul className="space-y-4">
            {currentRequest.request_id && (
              <li className="flex justify-between text-lg text-gray-700">
                <strong className="text-black">Request ID:</strong>
                <span>{currentRequest.request_id}</span>
              </li>
            )}
            {currentRequest.user_id && (
              <li className="flex justify-between text-lg text-gray-700">
                <strong className="text-black">User ID:</strong>
                <span>{currentRequest.user_id}</span>
              </li>
            )}
            {currentRequest.weight && (
              <li className="flex justify-between text-lg text-gray-700">
                <strong className="text-black">Weight:</strong>
                <span>{currentRequest.weight} kg</span>
              </li>
            )}
            {currentRequest.latitude && (
              <li className="flex justify-between text-lg text-gray-700">
                <strong className="text-black">Latitude:</strong>
                <span>{currentRequest.latitude}</span>
              </li>
            )}
            {currentRequest.longitude && (
              <li className="flex justify-between text-lg text-gray-700">
                <strong className="text-black">Longitude:</strong>
                <span>{currentRequest.longitude}</span>
              </li>
            )}
            {currentRequest.date && (
              <li className="flex justify-between text-lg text-gray-700">
                <strong className="text-black">Date:</strong>
                <span>{currentRequest.date}</span>
              </li>
            )}
            {currentRequest.time && (
              <li className="flex justify-between text-lg text-gray-700">
                <strong className="text-black">Time:</strong>
                <span>{currentRequest.time}</span>
              </li>
            )}
            {currentRequest.offered_price && (
              <li className="flex justify-between text-lg text-gray-700">
                <strong className="text-black">Offered Price:</strong>
                <span>{currentRequest.offered_price}</span>
              </li>
            )}
            {currentRequest.offered_by && (
              <li className="flex justify-between text-lg text-gray-700">
                <strong className="text-black">Offered By:</strong>
                <span>{currentRequest.offered_by}</span>
              </li>
            )}
          </ul>

          {/* Buttons Section */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => acceptOffer(currentRequest.request_id)}
              className="bg-custom-green text-black py-3 px-6 rounded-lg font-semibold border-2 border-black hover:bg-green-600 transition duration-300"
            >
              Accept
            </button>
            <button
              onClick={() => deleteRequest(currentRequest.request_id)}
              className="bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition duration-300"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateRequestForRecycledWaste;
