import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useSelector } from "react-redux";
import Loader from "../ui/Loader";
import Alert from '../ui/Alert';

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
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function CreateRequestForRecycledWaste() {
  const userData = useSelector((state) => state.userData.value);
  const [waste, setWaste] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [currentRequest, setCurrentRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestData, setRequestData] = useState({ latitude: "", longitude: "" });
  const [searchResults, setSearchResults] = useState([]);
  const searchResultsRef = useRef(null);
  const [current_schedules, set_current_schedules] = useState(null);
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
    if (!waste || !preferredDate || !preferredTime) {
      showAlert("warning", "Please fill all required fields");
      return;
    }
    if (!requestData.latitude || !requestData.longitude) {
      showAlert("warning", "Please select a location on the map");
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post("/api/requests/request_for_recycled_waste", {
        waste,
        preferredDate,
        preferredTime,
        latitude: requestData.latitude,
        longitude: requestData.longitude,
        userId: userData.user_id,
      });

      if (response.data.success) {
        showAlert("success", "Request submitted successfully!");
        setWaste("");
        setPreferredDate("");
        setPreferredTime("");
        setLocationName("");
        setRequestData({ latitude: "", longitude: "" });
        await fetchCurrentRequest();
      }
    } catch (err) {
      showAlert("error", err.response?.data?.message || "An error occurred");
    } finally {
      setSubmitting(false);
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
    if (!locationName.trim()) {
      setSearchResults([]);
      return;
    }
    const karachiBounds = {
      southWest: { lat: 24.774265, lon: 66.973096 },
      northEast: { lat: 25.102974, lon: 67.192733 },
    };

    try {
      const response = await axios.get(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(locationName)}&bbox=${karachiBounds.southWest.lon},${karachiBounds.southWest.lat},${karachiBounds.northEast.lon},${karachiBounds.northEast.lat}`
      );
      if (response.data && response.data.features.length > 0) {
        setSearchResults(response.data.features);
      }
    } catch {
      console.error("Error searching for location");
    }
  };

  const fetchCurrentRequest = async () => {
    try {
      const response = await axios.get(`/api/requests/request_for_recycled_waste/${userData.user_id}`);
      if (response.status === 200) {
        setCurrentRequest(response.data.requests[0] || null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const fetch_current_schedules = async () => {
    try {
      const response = await axios.get(`/api/schedule/get_schedule_for_user/${userData.user_id}`);
      set_current_schedules(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await fetchCurrentRequest();
        await fetch_current_schedules();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setTimeout(() => setLoading(false), 1000);
      }
    };
    fetchData();
  }, [userData.user_id]);

  const deleteRequest = async (requestId) => {
    try {
      const response = await axios.delete(`/api/requests/delete_request/${requestId}`);
      if (response.data.success) {
        setCurrentRequest(null);
        showAlert("success", response.data.message);
      } else {
        showAlert("error", response.data.message || "Failed to delete request");
      }
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to delete request");
    }
  };

  const acceptOffer = async (requestId) => {
    try {
      const response = await axios.post("/api/requests/accept_Offer", { requestId });
      if (response.status === 201) {
        showAlert("success", "Offer accepted! Schedule created.");
        setCurrentRequest(null);
        await fetchCurrentRequest();
        await fetch_current_schedules();
      } else {
        showAlert("error", response.data.message);
      }
    } catch {
      showAlert("error", "Failed to accept offer");
    }
  };

  useEffect(() => {
    const fetchLocationName = async () => {
      if (currentRequest?.latitude && currentRequest?.longitude) {
        try {
          const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: {
              lat: currentRequest.latitude,
              lon: currentRequest.longitude,
              format: "json",
            },
          });
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

  if (loading) return <Loader />;

  if (current_schedules && current_schedules.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Active Schedule Exists</h2>
          <p className="text-gray-500">You can only create one request at a time. Please complete and rate your current service before creating a new request.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {alert.map((a) => (
        <Alert
          key={a.id}
          type={a.type}
          message={a.message}
          onClose={() => setAlert((alerts) => alerts.filter((al) => al.id !== a.id))}
        />
      ))}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Request Waste Pickup</h1>
        <p className="text-gray-500 mt-1">Create a request for recycled waste collection</p>
      </div>

      {!currentRequest ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">New Pickup Request</h2>
                <p className="text-sm text-gray-500">Fill in the details below</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Waste Weight (kg)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    <input
                      type="number"
                      value={waste}
                      onChange={(e) => setWaste(e.target.value)}
                      placeholder="Enter weight"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type="time"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Location Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(e) => { setLocationName(e.target.value); handleSearchLocation(); }}
                    placeholder="Search for a location..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {searchResults.length > 0 && (
                  <ul
                    ref={searchResultsRef}
                    className="mt-2 bg-white border border-gray-200 shadow-lg rounded-xl max-h-48 overflow-y-auto"
                  >
                    {searchResults.map((result, index) => {
                      const { name, street, city, country } = result.properties || {};
                      const latitude = result.geometry?.coordinates[1];
                      const longitude = result.geometry?.coordinates[0];
                      const displayName = [name, street, city, country].filter(Boolean).join(", ");

                      return (
                        <li
                          key={index}
                          onClick={() => {
                            setRequestData({ latitude, longitude });
                            setLocationName(displayName);
                            setSearchResults([]);
                          }}
                          className="px-4 py-3 cursor-pointer hover:bg-emerald-50 text-gray-700 text-sm border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                        >
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="truncate">{displayName}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Selected Location */}
              {requestData.latitude && requestData.longitude && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-emerald-800">Location Selected</p>
                      <p className="text-sm text-emerald-600">
                        Lat: {parseFloat(requestData.latitude).toFixed(4)}, Lng: {parseFloat(requestData.longitude).toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Map */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Location on Map
                </label>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <MapContainer
                    center={requestData.latitude && requestData.longitude
                      ? [requestData.latitude, requestData.longitude]
                      : [24.8607, 67.0011]}
                    zoom={12}
                    style={{ height: "350px", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <LocationMarker />
                  </MapContainer>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Active Request</h2>
                <p className="text-sm text-gray-500">Waiting for company offers</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-xl text-gray-800">{currentRequest.weight} kg</p>
                    <p className="text-sm text-gray-500">Waste Weight</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {currentRequest.offered_price && (
                    <button
                      onClick={() => acceptOffer(currentRequest.request_id)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Accept Offer"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => deleteRequest(currentRequest.request_id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Request"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-gray-500">Preferred Date</p>
                    <p className="font-medium text-gray-800">
                      {`${new Date(currentRequest.date).getMonth() + 1}/${new Date(currentRequest.date).getDate()}/${new Date(currentRequest.date).getFullYear()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-500">Preferred Time</p>
                    <p className="font-medium text-gray-800">{currentRequest.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
                  <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium text-gray-800">{locationName || "Loading..."}</p>
                  </div>
                </div>
              </div>

              {currentRequest.offered_price ? (
                <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-emerald-700">Best Offer</p>
                        <p className="font-bold text-xl text-emerald-800">Rs. {currentRequest.offered_price}</p>
                      </div>
                    </div>
                    {currentRequest.company_name && (
                      <div className="text-right">
                        <p className="text-sm text-emerald-700">By</p>
                        <p className="font-medium text-emerald-800">{currentRequest.company_name}</p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => acceptOffer(currentRequest.request_id)}
                    className="mt-4 w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Accept Offer
                  </button>
                </div>
              ) : (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Waiting for Offers</p>
                      <p className="text-sm text-amber-600">Companies will review your request and send offers</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateRequestForRecycledWaste;
