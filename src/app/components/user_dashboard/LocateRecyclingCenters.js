import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Loader from '../ui/Loader'; // Assume you have a loader component
import Alert from '../ui/Alert'



const RecyclingCenterNearby = () => {
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [recyclingCenters, setRecyclingCenters] = useState([]);
  const [error, setError] = useState(null);
  const [viewMap, setViewMap] = useState(true);
  const [loading, setLoading] = useState(true); // Loading state
  const [alert, setAlert] = useState([]);
  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  }; 

  // Fetch user's location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log(latitude , longitude)
          setUserLocation({ latitude, longitude });
        },
        () => {
          setError('Unable to retrieve your location');
          showAlert("error" , "Unable to retrieve your location" )
          //console.error(err);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
      showAlert("error" , "Geolocation is not supported by this browser")
    }
  }, []);

  // Fetch recycling centers based on the user's location
  useEffect(() => {
    console.log(userLocation) ; 
    if (userLocation.latitude && userLocation.longitude) {
      const fetchRecyclingCenters = async () => {
        try {
          const response = await axios.get(`/api/users/get_recycling_centers_near_user/`, {
            params: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
          });

          // For each recycling center, get area and street info via reverse geocoding
          const updatedCenters = await Promise.all(
            response.data.map(async (center) => {
              const { latitude, longitude } = center;
              const geocodeResponse = await axios.get(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
              );
              const address = geocodeResponse.data.address || {};
              center.area = address.neighbourhood || address.city || 'N/A';
              center.street = address.road || 'N/A';
              return center;
            })
          );
          setRecyclingCenters(updatedCenters);
          setLoading(false); // Set loading to false once the data is fetched
        } catch{
          setError('Failed to fetch recycling centers');
          setLoading(false); // Stop loading in case of error
          //console.error(err);
          showAlert("error" , "Failed to fetch recycling centers")
        }
      };
      fetchRecyclingCenters();
    }
  }, [userLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const handleToggleView = () => {
    setViewMap(!viewMap);
  };

  if (error) {
    return <>
{alert.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
        />
      ))}     
    </>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
    <h1 className="sm:text-2xl md:text-4xl font-semibold text-center text-gray-800 mb-6">
      Recycling Centers Near You
    </h1>
    {alert.map((alert) => (
      <Alert
        key={alert.id}
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
      />
    ))}
    <button
      className="bg-custom-green text-custom-black px-6 py-2 rounded-lg mb-4 block mx-auto hover:bg-green-600 transition duration-300 transform hover:scale-105 border border-custom-black"
      onClick={handleToggleView}
    >
      {viewMap ? 'View as List' : 'View on Map'}
    </button>
  
    {userLocation.latitude && userLocation.longitude ? (
      loading ? (
        <div className="flex justify-center items-center py-6">
          <Loader /> {/* Loader component */}
        </div>
      ) : (
        viewMap ? (
          <MapContainer
            center={[userLocation.latitude, userLocation.longitude]}
            zoom={13}
            style={{ width: '100%', height: '400px', borderRadius: '12px' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <Marker position={[userLocation.latitude, userLocation.longitude]}>
              <Popup className="text-gray-700 font-semibold">You are here</Popup>
            </Marker>
  
            {recyclingCenters.map((center) => (
              <Marker
                key={center.recycling_center_id}
                position={[center.latitude, center.longitude]}
                icon={new L.Icon({
                  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png',
                  iconSize: [35, 35],
                  iconAnchor: [17, 17],
                  popupAnchor: [0, -15],
                })}
              >
                <Popup>{center.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {recyclingCenters.map((center) => {
                const distance = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  center.latitude,
                  center.longitude
                ).toFixed(2);
  
                return (
                  <div
                    key={center.recycling_center_id}
                    className="p-6 border rounded-lg shadow-sm bg-gray-50 hover:bg-green-50 hover:shadow-md transition-all duration-300 border-[#00ED64]"
                  >
                    <strong className="md:text-lg sm:text-base text-gray-800">{center.name}</strong>
                    <p className="md:text-sm sm:text-xs text-gray-600">Distance: {distance} km</p>
                    <p className="md:text-sm sm:text-xs text-gray-600">Area: {center.area}</p>
                    <p className="md:text-sm sm:text-xs text-gray-600">Street: {center.street}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )
    ) : (
      <div className="flex justify-center items-center py-6">
        <Loader />
      </div>
    )}
  </div>
  
  );
};

export default RecyclingCenterNearby;
