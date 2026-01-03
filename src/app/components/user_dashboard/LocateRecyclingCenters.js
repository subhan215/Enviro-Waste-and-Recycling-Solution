import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Loader from '../ui/Loader';
import Alert from '../ui/Alert';
import NoDataDisplay from '../animations/NoDataDisplay';

const RecyclingCenterNearby = () => {
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [recyclingCenters, setRecyclingCenters] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState([]);

  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        () => {
          setError('Unable to retrieve your location');
          showAlert("error", "Unable to retrieve your location");
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
      showAlert("error", "Geolocation is not supported by this browser");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userLocation.latitude && userLocation.longitude) {
      const fetchRecyclingCenters = async () => {
        try {
          const response = await axios.get(`/api/users/get_recycling_centers_near_user/`, {
            params: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
          });

          const updatedCenters = await Promise.all(
            response.data.map(async (center) => {
              const { latitude, longitude } = center;
              try {
                const geocodeResponse = await axios.get(
                  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                );
                const address = geocodeResponse.data.address || {};
                center.area = address.neighbourhood || address.city || 'N/A';
                center.street = address.road || 'N/A';
              } catch {
                center.area = 'N/A';
                center.street = 'N/A';
              }
              return center;
            })
          );
          setRecyclingCenters(updatedCenters);
          setLoading(false);
        } catch {
          setError('Failed to fetch recycling centers');
          showAlert("error", "Failed to fetch recycling centers");
          setLoading(false);
        }
      };
      fetchRecyclingCenters();
    }
  }, [userLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const tabs = [
    { id: 'map', label: 'Map View', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    )},
    { id: 'list', label: 'List View', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    )},
  ];

  if (error && !userLocation.latitude) {
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Location Access Required</h2>
          <p className="text-gray-500">Please enable location access to find recycling centers near you.</p>
        </div>
      </div>
    );
  }

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
        <p className="text-gray-500 mt-1">Find recycling centers near your location</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Centers Found</p>
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
              <p className="text-sm text-gray-500 font-medium">Nearby (5km)</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {recyclingCenters.filter(c =>
                  calculateDistance(userLocation.latitude, userLocation.longitude, c.latitude, c.longitude) < 5
                ).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Closest Center</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {recyclingCenters.length > 0
                  ? `${Math.min(...recyclingCenters.map(c =>
                      calculateDistance(userLocation.latitude, userLocation.longitude, c.latitude, c.longitude)
                    )).toFixed(1)} km`
                  : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'map' && userLocation.latitude && userLocation.longitude && (
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <MapContainer
                center={[userLocation.latitude, userLocation.longitude]}
                zoom={13}
                style={{ width: '100%', height: '450px' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={[userLocation.latitude, userLocation.longitude]}>
                  <Popup>
                    <div className="text-center">
                      <strong className="text-emerald-600">Your Location</strong>
                    </div>
                  </Popup>
                </Marker>

                {recyclingCenters.map((center) => (
                  <Marker
                    key={center.recycling_center_id}
                    position={[center.latitude, center.longitude]}
                    icon={new L.Icon({
                      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                      popupAnchor: [1, -34],
                      shadowSize: [41, 41]
                    })}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong className="text-emerald-600">{center.name}</strong>
                        <p className="text-gray-600">{center.street}, {center.area}</p>
                        <p className="text-gray-500">
                          {calculateDistance(userLocation.latitude, userLocation.longitude, center.latitude, center.longitude).toFixed(2)} km away
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {activeTab === 'list' && (
            <div>
              {recyclingCenters.length === 0 ? (
                <NoDataDisplay emptyText="No recycling centers found nearby" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recyclingCenters
                    .sort((a, b) =>
                      calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude) -
                      calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude)
                    )
                    .map((center) => {
                      const distance = calculateDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        center.latitude,
                        center.longitude
                      ).toFixed(2);

                      return (
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
                                <h3 className="font-semibold text-gray-800 truncate">{center.name}</h3>
                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                  {distance} km
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  </svg>
                                  <span>{center.street}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span>{center.area}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecyclingCenterNearby;
