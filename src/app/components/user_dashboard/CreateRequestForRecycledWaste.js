import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";
import { FaCheck, FaTrash } from "react-icons/fa"; // Import icons from react-icons
import Alert from '../ui/Alert'
import Incorrect from '../ui/Incorrect'


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
  // console.log(userData);
  const [waste, setWaste] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [locationName, setLocationName] = useState("");
  //const [map, setMap] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentRequest, setCurrentRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestData, setRequestData] = useState({
    latitude: "",
    longitude: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const searchResultsRef = useRef(null);
  const [current_schedules, set_current_schedules] = useState(null)
  const [alert, setAlert] = useState([]);
  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };



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
        //alert("Request submitted successfully!");
        showAlert("success" , "Request submitted successfully!")
        setWaste("");
        setPreferredDate("");
        setPreferredTime("");
        setLocationName("");
        setRequestData({ latitude: "", longitude: "" });
        await fetchCurrentRequest();
      }
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        console.log(e)
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
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          locationName
        )}&bbox=${karachiBounds.southWest.lon},${karachiBounds.southWest.lat},${karachiBounds.northEast.lon},${karachiBounds.northEast.lat}`
      );
      console.log(response)
      if (response.data && response.data.features.length > 0) {
        setSearchResults(response.data.features);
      }
    } catch {
      setError("Error searching for location");
    }
  };
  const fetchCurrentRequest = async () => {
    try {
      const response = await axios.get(
        `/api/requests/request_for_recycled_waste/${userData.user_id}` // Replace with actual dynamic user ID
      );
      console.log(response);
      if (response.status === 200) {
        setCurrentRequest(response.data.requests[0]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };


  const fetch_current_schedules = async () => {
    try{
      const response = await axios.get(`/api/schedule/get_schedule_for_user/${userData.user_id}`)
      console.log("REspnse ka data : ", response.data)
      set_current_schedules(response.data);

    }
    catch(error){
      console.log(error);
    }
    finally{
      setLoading(false);
    }
    
  }


  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchCurrentRequest(); // Call the fetch function here
        await fetch_current_schedules();
      console.log("Schedyke : ", current_schedules)

      } catch (error) {
        console.error('Error fetching current request:', error);
      } finally {
        setTimeout(() => {
          setLoading(false); // You can adjust or remove this timeout depending on your needs
        }, 1000); // Optional delay
      }
    };

    fetchData(); // Call the function inside useEffect
  }, [userData.user_id]); // Depend on user ID or other props if necessary
  const deleteRequest = async (requestId) => {
    try {
      console.log(`Attempting to delete request with ID: ${requestId}`);
      const response = await axios.delete(
        `/api/requests/delete_request/${requestId}`
      );

      console.log("Response:", response);

      if (response.data.success) {
        setCurrentRequest(null);
        //alert(response.data.message);
        showAlert("success" , response.data.message)
      } else {
        // Handle case where the server responded but with an issue (e.g., no success flag)
        console.error("Delete operation failed:", response.data);
        setError("Delete operation did not succeed.");
        // alert(
        //   response.data.message ||
        //   "An error occurred while deleting the request."
        // );
        showAlert("error" , response.data.message || "An error occurred while deleting the request." )
      }
    } catch (err) {
      // Detailed error logging
      //console.error("Error occurred during delete request:", err);
      showAlert("error" , "Error occurred during delete request")

      if (err.response) {
        // Server responded with a status other than 2xx
        console.error("Error Response Data:", err.response.data);
        console.error("Error Response Status:", err.response.status);
        console.error("Error Response Headers:", err.response.headers);
        setError(err.response.data.message || "Failed to delete the request");
        // alert(
        //   `Error: ${err.response.data.message || "Failed to delete the request"
        //   }`
        // );
        showAlert("error" , err.response.data.message || "Failed to delete the request" )
      } else if (err.request) {
        // Request was made but no response received
        console.error("No response received:", err.request);
        setError("No response from the server.");
        //alert("No response received from the server.");
        showAlert("error" , "No response received from the server")
      } else {
        // Other unexpected errors
        console.error("Error Message:", err.message);
        setError("Unexpected error occurred.");
        //alert(`Error: ${err.message}`);
        showAlert("error" , err.message)
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
        //alert(response.data.message); // Success message
        //currentRequest(null)
        //alert("See schedule tab.A new schedule has been created!");
        showAlert("success" , "New schedule has been created")
        setCurrentRequest(null);  
        await fetchCurrentRequest();
        await fetch_current_schedules();
        // Optionally update the UI state, e.g., reset the current request or show the schedule
      } else {
        //alert(response.data.message); // Error message if status is not 201
        showAlert("error" , response.data.message)
      }
    } catch{
      //console.error("Error accepting the offer:", error);
      //alert("Failed to accept the offer, please try again.");
      showAlert("error" , "Failed to accept the offer, please try again.") 
    }
  };
  useEffect(() => {
    const fetchLocationName = async () => {
      if (currentRequest?.latitude && currentRequest?.longitude) {
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
              params: {
                lat: currentRequest.latitude,
                lon: currentRequest.longitude,
                format: "json",
              },
            }
          );
          console.log(response);
          if (response.data && response.data.display_name) {
            setLocationName(response.data.display_name);
          } else {
            setLocationName("Unknown Location");
          }
        } catch (error) {
          console.error("Error fetching location name:", error);
          setLocationName("Failed to fetch location");
        }
      }
    };

    fetchLocationName();
  }, [currentRequest?.latitude, currentRequest?.longitude]);
  if (loading) return <Loader></Loader>;
  if(current_schedules) return <><Incorrect text = "Can only create 1 schedule at a time. Don't forget to Rate the service before creating a new request"/></>
  return (
    <div className="container mx-auto px-4 py-8 ">
      {!currentRequest ? (
        <div className=" p-8 rounded-lg ">
          <h2 className="text-3xl font-bold text-black  p-2 mb-6 rounded">
            Create Request for Recycled Waste
          </h2>

          {alert.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
        />
      ))}  

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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-custom-black placeholder:text-custom-black"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-custom-black placeholder:text-custom-black"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-custom-black placeholder:text-custom-black"
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
              id="waste"
              value={locationName}
              onChange={(e) => { setLocationName(e.target.value); handleSearchLocation() }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-custom-black placeholder:text-custom-black"
            />
            {searchResults.length > 0 && (
              <ul
                ref={searchResultsRef}
                className="bg-white border border-gray-300 shadow-lg rounded-lg max-h-40 overflow-y-auto w-full z-20 mt-1"
              >
                {searchResults.map((result, index) => {
                  const { name, street, city, country } = result.properties || {};
                  const latitude = result.geometry?.coordinates[1];
                  const longitude = result.geometry?.coordinates[0];

                  return (
                    <li
                      key={index}
                      onClick={() =>
                        setRequestData({ ...requestData, latitude, longitude })
                      }
                      className="p-2 cursor-pointer hover:bg-gray-100 text-gray-800 text-sm"
                    >
                      {[name, street, city, country].filter(Boolean).join(", ")}
                    </li>
                  );
                })}
              </ul>
            )}
            <h3 className="text-xl font-bold mb-4 text-black">
              Select Location on Map
            </h3>
            <MapContainer
              center={[24.8607, 67.0011]}
              zoom={12}
              style={{ height: "400px", width: "100%" }}
              //whenCreated={setMap}
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
<div className="py-10">
  <h3 className="text-xl sm:text-lg md:text-base lg:text-xl font-bold text-black mb-4">
    Request Details
  </h3>

  <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white p-6 shadow-lg rounded-lg relative text-sm sm:text-xs md:text-xs lg:text-sm">
      {/* Icon Buttons Section - Top Right Corner */}
      <div className="absolute top-2 right-2 flex gap-4">
        {currentRequest.offered_price && (
          <button
            onClick={() => acceptOffer(currentRequest.request_id)}
            className="text-green-500 hover:text-green-700"
          >
            <FaCheck size={24} />
          </button>
        )}
        <button
          onClick={() => deleteRequest(currentRequest.request_id)}
          className="text-red-500 hover:text-red-700"
        >
          <FaTrash size={24} />
        </button>
      </div>

      {/* Request Details Section */}
      <div className="grid grid-cols-2 gap-y-4 text-sm sm:text-xs md:text-xs lg:text-sm text-gray-700">
        {currentRequest.user_id && (
          <>
            <strong className="text-black">User Name:</strong>
            <span>{currentRequest.name}</span>
          </>
        )}
        {currentRequest.weight && (
          <>
            <strong className="text-black">Weight:</strong>
            <span>{currentRequest.weight} kg</span>
          </>
        )}
        {currentRequest.latitude && currentRequest.longitude && (
          <>
            <strong className="text-black">Location:</strong>
            <span>{locationName || "Loading..."}</span>
          </>
        )}
        {currentRequest.date && (
          <>
            <strong className="text-black">Date:</strong>
            <span>
              {`${new Date(currentRequest.date).getMonth() + 1}/${new Date(
                currentRequest.date
              ).getDate()}/${new Date(currentRequest.date).getFullYear()}`}
            </span>
          </>
        )}
        {currentRequest.time && (
          <>
            <strong className="text-black">Time:</strong>
            <span>{currentRequest.time}</span>
          </>
        )}
        {currentRequest.offered_price && (
          <>
            <strong className="text-black">Offered Price:</strong>
            <span>{currentRequest.offered_price}</span>
          </>
        )}
        {currentRequest.offered_by && (
          <>
            <strong className="text-black">Offered By:</strong>
            <span>{currentRequest.company_name}</span>
          </>
        )}
      </div>

      {/* Success or Error Messages */}
      {successMessage && (
        <p className="text-custom-green mt-4 text-center">{successMessage}</p>
      )}
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
    </div>
  </div>
</div>
      )
      }
    </div >

  );
}
export default CreateRequestForRecycledWaste;
