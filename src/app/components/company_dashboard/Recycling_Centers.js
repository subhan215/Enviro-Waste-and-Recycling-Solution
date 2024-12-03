import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSelector } from 'react-redux';
import Loader from "../ui/Loader";

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
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [map, setMap] = useState(null);
    const [areas, setAreas] = useState([]); // State to hold areas
    const userData = useSelector((state) => state.userData.value)
    let companyId = userData.user_id
    const fetchRecyclingCenters = async () => {
        try {
            const response = await axios.get(`/api/company/recycling_center/get_company_recycling_centers/${companyId}`);
            console.log(response)
            setRecyclingCenters(response.data.data);
            //setLoading(false);
        } catch (err) {
            setError('Error fetching recycling centers');
            //setLoading(false);
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
            alert(data.message)
            setRecyclingCenters([...recyclingCenters , data.data])
            //fetchRecyclingCenters()
            setNewCenter({ area_id: '', latitude: '', longitude: '' });
        } catch (err) {
            console.error(err);
            setError('Error creating recycling center');
        }
    };
    
    const handleSearchLocation = async () => {
        // Define the bounding box for Karachi
        const karachiBounds = {
            southWest: { lat: 24.774265, lon: 66.973096 }, // Southwest corner
            northEast: { lat: 25.102974, lon: 67.192733 }, // Northeast corner
        };
    
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&bounded=1&viewbox=${karachiBounds.northEast.lon},${karachiBounds.northEast.lat},${karachiBounds.southWest.lon},${karachiBounds.southWest.lat}`
            );
    
            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0]; // Get the first result
                setNewCenter({ ...newCenter, latitude: lat, longitude: lon });
    
                // If you want to set the map view
                map.setView([lat, lon], 14); // Zoom level can be adjusted
            } else {
                setError('Location not found');
            }
        } catch (err) {
            //setError('Error searching for location');
            console.log(err)
        }
    };

    // Set the map reference when the component mounts
    const mapRef = useMapEvents({
        load: (mapInstance) => {
            setMap(mapInstance);
        }
    });
    
    if (loading) return<><Loader></Loader></>;
    return (
<div className="p-6 text-custom-black bg-white shadow-lg rounded-lg ">
  <h2 className="text-2xl font-bold text-custom-black mb-6">Recycling Centers</h2>

  {loading ? (
    <><Loader></Loader></>
  ) : error ? (
    <p className="text-lg text-red-500 text-center">{error}</p>
  ) : (
    <div>
      <h3 className="text-xl font-semibold text-custom-black mb-4">Existing Centers</h3>
      <ul className="space-y-4">
  {recyclingCenters.map((center) => (
    <li
      key={center.recycling_center_id}
      className="p-4 bg-white rounded-lg shadow-md hover:scale-105 transition-transform duration-200 border-2 border-custom-green"
    >
      <div className="text-lg font-semibold text-custom-black">
        <strong>Area ID:</strong> {center.area_id}
      </div>
      <div className="text-lg text-custom-black">
        <strong>Latitude:</strong> {center.latitude}
      </div>
      <div className="text-lg text-custom-black">
        <strong>Longitude:</strong> {center.longitude}
      </div>
    </li>
  ))}
</ul>

    </div>
  )}

  <div className="mt-8">
    <h3 className="text-xl font-semibold text-custom-black mb-4">Create a New Recycling Center</h3>
    <form onSubmit={handleCreateCenter} className="space-y-4">
      <div>
        <label className="text-lg text-custom-black font-semibold">Area:</label>
        <select
          name="area_id"
          value={newCenter.area_id}
          onChange={handleInputChange}
          required
          className="mt-2 px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-green"
        >
          <option value="">Select an area</option>
          {areas.map((area) => (
            <option key={area.area_id} value={area.area_id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-lg text-custom-black font-semibold">Latitude:</label>
        <input
          type="text"
          name="latitude"
          value={newCenter.latitude}
          onChange={handleInputChange}
          readOnly
          required
          className="mt-2 px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-green"
        />
      </div>
      <div>
        <label className="text-lg text-custom-black font-semibold">Longitude:</label>
        <input
          type="text"
          name="longitude"
          value={newCenter.longitude}
          onChange={handleInputChange}
          readOnly
          required
          className="mt-2 px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-green"
        />
      </div>
      <button
        type="submit"
        className="px-6 py-3 mt-4 bg-custom-green text-black rounded-lg hover:rounded-2xl transition duration-200 border border-black"
      >
        Create Center
      </button>
    </form>
  </div>

  <div className="mt-8">
    <h3 className="text-xl font-semibold text-custom-black mb-4">Search Location</h3>
    <input
      type="text"
      value={locationName}
      onChange={(e) => setLocationName(e.target.value)}
      placeholder="Enter location name"
      className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-custom-green mb-4"
    />
    <button
      onClick={handleSearchLocation}
      className="px-6 py-3 bg-custom-green text-black rounded-lg transition duration-200 hover:rounded-2xl border border-black"
    >
      Search
    </button>
  </div>

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

    );
};

export default RecyclingCenters;
