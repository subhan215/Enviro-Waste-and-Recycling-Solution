import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSelector } from 'react-redux';
import Loader from "../ui/Loader";
import { Popup } from 'react-leaflet';
import Alert from '../ui/Alert';
import NoDataDisplay from '../animations/NoDataDisplay';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const RecyclingCenters = () => {
  const [recyclingCenters, setRecyclingCenters] = useState([]);
  const [newCenter, setNewCenter] = useState({ latitude: '', longitude: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [areaNames, setAreaNames] = useState([]);
  const [requests_area_names, set_requests_area_names] = useState([]);
  const userData = useSelector((state) => state.userData.value);
  const [activeTab, setActiveTab] = useState('centers');
  const [searchResults, setSearchResults] = useState([]);
  const searchResultsRef = useRef(null);
  const [alert, setAlert] = useState([]);
  const [areaLoading, setAreaLoading] = useState(false);
  const [currentRequests, setCurrentRequests] = useState([]);

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  const companyId = userData.user_id;

  const fetchRecyclingCenters = async () => {
    try {
      const response = await axios.get(`/api/company/recycling_center/get_company_recycling_centers/${companyId}`);
      setRecyclingCenters(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recycling centers:', error);
    }
  };

  const fetchCurrentRequests = async () => {
    try {
      const response = await axios.get(`/api/company/recycling_center/get_company_recycling_center_requests/${companyId}`);
      setCurrentRequests(response.data.data || []);
    } catch (error) {
      console.error("Error fetching current requests:", error);
    }
  };

  const fetchAreaName = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      if (!response.ok) throw new Error(`Failed to fetch data`);
      const data = await response.json();
      if (data?.address) {
        const { road, neighbourhood, city } = data.address;
        return `${road || ''} ${neighbourhood || ''} ${city || ''}`.trim() || "Unknown Area";
      }
      return "Unknown Area";
    } catch (error) {
      console.error("Error fetching area name:", error);
      return "Unknown Area";
    }
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchCurrentRequests(), fetchRecyclingCenters()]);
      setLoading(false);
    };
    setTimeout(fetchAll, 1000);
  }, [companyId]);

  useEffect(() => {
    const fetchAllAreaNames = async () => {
      if (recyclingCenters.length === 0 && currentRequests.length === 0) return;
      setAreaLoading(true);
      try {
        const recyclingCenterNames = await Promise.all(
          recyclingCenters.map(async (center) => await fetchAreaName(center.latitude, center.longitude))
        );
        const requestAreaNames = await Promise.all(
          currentRequests.map(async (request) => await fetchAreaName(request.latitude, request.longitude))
        );
        setAreaNames(recyclingCenterNames);
        set_requests_area_names(requestAreaNames);
      } catch (error) {
        console.error("Error fetching area names:", error);
      } finally {
        setAreaLoading(false);
      }
    };
    fetchAllAreaNames();
  }, [recyclingCenters, currentRequests]);

  const handleCreateCenter = async (e) => {
    e.preventDefault();
    if (!newCenter.latitude || !newCenter.longitude) {
      showAlert("warning", "Please select a location from the search results");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/company/recycling_center/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          area_id: newCenter.area_id,
          latitude: newCenter.latitude,
          longitude: newCenter.longitude,
        }),
      });
      const data = await response.json();
      if (data.success) {
        showAlert("success", "Recycling center request submitted successfully!");
        setNewCenter({ area_id: '', latitude: '', longitude: '' });
        setLocationName('');
        setSearchResults([]);
        fetchCurrentRequests();
      } else {
        showAlert("error", data.message || "Failed to create request");
      }
    } catch (err) {
      showAlert("error", "Error creating recycling center request");
    } finally {
      setSubmitting(false);
    }
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

  const tabs = [
    { id: 'centers', label: 'My Centers', count: recyclingCenters.length },
    { id: 'requests', label: 'Pending Requests', count: currentRequests.length },
    { id: 'create', label: 'Create New', count: null },
  ];

  if (loading) return <Loader />;

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Recycling Centers</h1>
        <p className="text-gray-500 mt-1">Manage your recycling center locations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Centers</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{recyclingCenters.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Requests</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{currentRequests.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Coverage</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{recyclingCenters.length + currentRequests.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* My Centers Tab */}
          {activeTab === 'centers' && (
            <div className="space-y-6">
              {recyclingCenters.length === 0 ? (
                <NoDataDisplay emptyText="No recycling centers yet" />
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {recyclingCenters.map((center, index) => (
                      <div
                        key={center.recycling_center_id}
                        className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-800 truncate">
                                {areaLoading ? (
                                  <span className="text-gray-400">Loading location...</span>
                                ) : (
                                  areaNames[index] || 'Unknown Location'
                                )}
                              </h3>
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                Active
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <span>Lat: {parseFloat(center.latitude).toFixed(4)}, Lng: {parseFloat(center.longitude).toFixed(4)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Map Section */}
                  <div className="mt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Centers Map View</h3>
                        <p className="text-sm text-gray-500">All your active recycling centers</p>
                      </div>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-200">
                      <MapContainer
                        center={recyclingCenters.length > 0
                          ? [recyclingCenters[0].latitude, recyclingCenters[0].longitude]
                          : [24.8607, 67.0011]}
                        zoom={12}
                        style={{ height: '400px', width: '100%' }}
                      >
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {recyclingCenters.map((center, index) => (
                          <Marker
                            key={center.recycling_center_id}
                            position={[center.latitude, center.longitude]}
                          >
                            <Popup>
                              <div className="text-sm">
                                <strong className="text-emerald-600">Recycling Center</strong><br />
                                {areaNames[index] || "Loading..."}
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Pending Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              {currentRequests.length === 0 ? (
                <NoDataDisplay emptyText="No pending requests" />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {currentRequests.map((request, index) => (
                    <div
                      key={request.request_submit_material_id || index}
                      className="bg-gradient-to-br from-white to-amber-50/30 border border-amber-100 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-800 truncate">
                              {areaLoading ? (
                                <span className="text-gray-400">Loading location...</span>
                              ) : (
                                requests_area_names[index] || 'Unknown Location'
                              )}
                            </h3>
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              Pending
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span>Lat: {parseFloat(request.latitude).toFixed(4)}, Lng: {parseFloat(request.longitude).toFixed(4)}</span>
                            </div>
                          </div>
                          <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Awaiting admin approval
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create New Tab */}
          {activeTab === 'create' && (
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Create New Recycling Center</h3>
                  <p className="text-sm text-gray-500">Search and select a location for your new center</p>
                </div>
              </div>

              <form onSubmit={handleCreateCenter} className="space-y-6">
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
                      placeholder="Enter location name to search..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Search Results */}
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
                              setNewCenter({ ...newCenter, latitude, longitude });
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

                {/* Selected Location Display */}
                {newCenter.latitude && newCenter.longitude && (
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
                          Lat: {parseFloat(newCenter.latitude).toFixed(4)}, Lng: {parseFloat(newCenter.longitude).toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Map Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location Preview
                  </label>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <MapContainer
                      center={newCenter.latitude && newCenter.longitude
                        ? [newCenter.latitude, newCenter.longitude]
                        : [24.8607, 67.0011]}
                      zoom={13}
                      style={{ height: '300px', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      {newCenter.latitude && newCenter.longitude && (
                        <Marker position={[newCenter.latitude, newCenter.longitude]}>
                          <Popup>Selected location for new recycling center</Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !newCenter.latitude || !newCenter.longitude}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Submit Request for Approval
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecyclingCenters;
