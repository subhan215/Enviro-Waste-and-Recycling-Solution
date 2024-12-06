import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSelector } from 'react-redux';
import Loader from "../ui/Loader";
import { Popup } from 'react-leaflet';
import Alert from '../ui/Alert'
import Recycle_loader from '../ui/Recycle_loader'



const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(mod => mod.useMapEvents), { ssr: false });

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const RecyclingCenters = ({}) => {
    const [recyclingCenters, setRecyclingCenters] = useState([]);
    const [newCenter, setNewCenter] = useState({ area_id: '', latitude: '', longitude: '' });
    const [loading, setLoading] = useState(true);
    const [recycle_loading, set_recycleLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [map, setMap] = useState(null);
    const [areaNames, setAreaNames] = useState([]);
    const userData = useSelector((state) => state.userData.value)
    const [viewMode, setViewMode] = useState('view'); // 'view
    const [ searchResults, setSearchResults] = useState([])
    const searchResultsRef = useRef(null);
    const [alert, setAlert] = useState([]);
  const showAlert = (type, message) => {
    const id = Date.now();
    setAlert([...alert, { id, type, message }]);
    setTimeout(() => {
      setAlert((alerts) => alerts.filter((alert) => alert.id !== id));
    }, 4000);
  };


    const toggleView = () => {
      setViewMode(viewMode === 'view' ? 'create' : 'view');
    };
    let companyId = userData.user_id
    const fetchRecyclingCenters = async () => {
      set_recycleLoading(true);
        try {
            const response = await axios.get(`/api/company/recycling_center/get_company_recycling_centers/${companyId}`);
            console.log(response)
            setRecyclingCenters(response.data.data);
            //setLoading(false);
        } catch (err) {
            setError('Error fetching recycling centers');
            //setLoading(false);
        }
        finally{
          set_recycleLoading(false);
        }
    };
   
    useEffect(() => {
        const fetchData = async () => {
          setTimeout(async () => {
            await fetchRecyclingCenters();
            setLoading(false);
          }, 1000);
        };
        fetchData();
      }, []);

    useEffect(() => {
        // Fetch areas from your API when the component mounts
        const fetchAreas = async () => {
            try {
                const response = await fetch(`/api/company/recycling_center/get_unassigned_areas/${companyId}`); // Adjust this URL as needed
                const data = await response.json();
                if (data.success) {
                    setAreas(data.data); // Assuming the API returns an array of areas
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error fetching areas:', error);
            }
        };
        fetchAreas();
    }, []);

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setNewCenter({ ...newCenter, latitude: lat, longitude: lng });
            },
        });

        return newCenter.latitude && newCenter.longitude ? (
            <Marker position={[newCenter.latitude, newCenter.longitude]} />
        ) : null;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCenter({ ...newCenter, [name]: value });
    };

    const handleCreateCenter = async (e) => {
        e.preventDefault();
        setError('') ; 
        try {
            const response = await fetch('/api/company/recycling_center/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company_id: companyId,
                    area_id: newCenter.area_id,
                    latitude: newCenter.latitude,
                    longitude: newCenter.longitude,
                }),
            }) ; 
            console.log(response)
            const data = await response.json();
            console.log(data)
            //alert(data.message)
            showAlert("success" , "Recycle center created!")
            setRecyclingCenters([...recyclingCenters , data.data])
            //fetchRecyclingCenters()
            setNewCenter({ area_id: '', latitude: '', longitude: '' });

        } catch (err) {
            //console.error(err);
            showAlert("error" , err);
            setError('Error creating recycling center');
        }

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
  
    
    // Set the map reference when the component mounts
    const mapRef = useMapEvents({
        load: (mapInstance) => {
            setMap(mapInstance);
        }
    });
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
      // Fetch area names for all recycling centers
      const getAreaNames = async () => {
        const names = await Promise.all(
          recyclingCenters.map(async (center) => {
            const areaName = await fetchAreaName(center.latitude, center.longitude);
            return areaName;
          })
        );
        setAreaNames(names);
        setLoading(false); // Set loading to false when the data is fetched
      };
  
      getAreaNames();
    }, [recyclingCenters]);
    return (
      <div className="p-6 text-custom-black rounded-lg">
        <h2 className="text-2xl font-bold text-custom-black mb-6">Recycling Centers</h2>
        {alert.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((alert) => alert.filter((a) => a.id !== alert.id))}
        />
      ))}        
        {/* Toggle View Button */}
        <button
          onClick={toggleView}
          className="px-6 py-2 mb-6 bg-custom-green text-black rounded-lg hover:rounded-2xl transition duration-200 border border-black"
        >
          {viewMode === 'view' ? 'Create New Center' : 'View Existing Centers'}
        </button>
  
        {/* If loading, show the loader */}
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-lg text-red-500 text-center">{error}</p>
        ) : viewMode === 'view' ? (
          <div>
      <h3 className="text-xl font-semibold text-custom-black mb-4">Existing Centers</h3>

          {recycle_loading && <Recycle_loader></Recycle_loader>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recyclingCenters.map((center, index) => (
          <div
            key={center.recycling_center_id}
            className="p-4 bg-white rounded-lg shadow-md hover:scale-105 transition-transform duration-200 border-2 border-custom-green"
          >
            <div className="text-lg font-semibold text-custom-black">
              <strong>Area:</strong> {loading ? "Loading..." : areaNames[index]}
            </div>
            <div className="text-lg text-custom-black">
              <strong>Latitude:</strong> {center.latitude}
            </div>
            <div className="text-lg text-custom-black">
              <strong>Longitude:</strong> {center.longitude}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-custom-black mb-4">Recycling Centers on Map</h3>
        <MapContainer
          center={[24.8607, 67.0011]} // Default center coordinates (can be modified)
          zoom={12}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {/* Loop through recycling centers and display as markers */}
          {recyclingCenters.map((center, index) => (
            <Marker
              key={center.recycling_center_id}
              position={[center.latitude, center.longitude]}
            >
              <Popup>
                <div>
                  <strong>Area:</strong> {areaNames[index] || "loading"}<br />
                  <strong>Latitude:</strong> {center.latitude}<br />
                  <strong>Longitude:</strong> {center.longitude}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
        ) : (
          // Create New Recycling Center
          <div className="mt-3">
            <h3 className="text-xl font-semibold text-custom-black mb-4">Create a New Recycling Center</h3>
            <form onSubmit={handleCreateCenter} className="space-y-4">
             
            {/* Search and Map Section */}
        <div className="mt-3">
          <h3 className="text-xl font-semibold text-custom-black mb-4">Search Location</h3>
          <input
            type="text"
            value={locationName}
            onChange={(e) => {setLocationName(e.target.value) ; handleSearchLocation()}}
            placeholder="Enter location name"
            className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-green mb-4"
          /> {searchResults.length > 0 && (
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
                      setNewCenter({ ...newCenter, latitude, longitude })
                    }
                    className="p-2 cursor-pointer hover:bg-gray-100 text-gray-800 text-sm"
                  >
                    {[name, street, city, country].filter(Boolean).join(", ")}
                  </li>
                );
              })}
            </ul>
          )}
          
        </div>
        <button
                type="submit"
                className="px-6 py-3 mt-4 bg-custom-green text-black rounded-lg hover:rounded-2xl transition duration-200 border border-black"
              >
                Create Center
              </button>
        </form>
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-custom-black mb-4">Select Location on Map</h3>
          <MapContainer center={[24.8607, 67.0011]} zoom={12} style={{ height: '400px', width: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <LocationMarker />
          </MapContainer>
        </div>
          </div>
        )}
  
        
      </div>
    );
};

export default RecyclingCenters;
