import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

const RecyclingCenters = ({ companyId }) => {
    const [recyclingCenters, setRecyclingCenters] = useState([]);
    const [newCenter, setNewCenter] = useState({ area_id: '', latitude: '', longitude: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [map, setMap] = useState(null);
    const [areas, setAreas] = useState([]); // State to hold areas

    useEffect(() => {
        const fetchRecyclingCenters = async () => {
            try {
                const response = await axios.get(`/api/company/recycling_center/get_company_recycling_centers/${1}`);
                console.log(response)
                setRecyclingCenters(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Error fetching recycling centers');
                setLoading(false);
            }
        };

        fetchRecyclingCenters();

    }, []); 
    useEffect(() => {
        // Fetch areas from your API when the component mounts
        const fetchAreas = async () => {
            try {
                const response = await fetch(`/api/company/recycling_center/get_unassigned_areas/${1}`); // Adjust this URL as needed
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
        try {
            const response = await fetch('/api/company/recycling_center/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company_id: 1,
                    area_id: newCenter.area_id,
                    latitude: newCenter.latitude,
                    longitude: newCenter.longitude,
                }),
            }) ; 
            console.log(response)
            const data = await response.json();
            console.log(data)
            alert(data.message)
            setRecyclingCenters([...recyclingCenters, data.data]);
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
            setError('Error searching for location');
        }
    };

    // Set the map reference when the component mounts
    const mapRef = useMapEvents({
        load: (mapInstance) => {
            setMap(mapInstance);
        }
    });

    return (
        <div>
            <h2>Recycling Centers</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <ul>
                    {recyclingCenters.map((center) => (
                        <li key={center.recycling_center_id}>
                            <strong>Area ID:</strong> {center.area_id}, 
                            <strong> Latitude:</strong> {center.latitude}, 
                            <strong> Longitude:</strong> {center.longitude}
                        </li>
                    ))}
                </ul>
            )}

            <h3>Create a New Recycling Center</h3>
            <form onSubmit={handleCreateCenter}>
                <div>
                <label>
                Area:
                <select
                    name="area_id"
                    value={newCenter.area_id}
                    onChange={handleInputChange}
                    required
                >
                    <option value="">Select an area</option>
                    {areas.map((area) => (
                        <option key={area.area_id} value={area.area_id}>
                            {area.name} {/* Assuming each area has a name */}
                        </option>
                    ))}
                </select>
            </label>
                </div>
                <div>
                    <label>
                        Latitude:
                        <input
                            type="text"
                            name="latitude"
                            value={newCenter.latitude}
                            onChange={handleInputChange}
                            readOnly
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Longitude:
                        <input
                            type="text"
                            name="longitude"
                            value={newCenter.longitude}
                            onChange={handleInputChange}
                            readOnly
                            required
                        />
                    </label>
                </div>
                <button type="submit">Create Center</button>
            </form>

            <h3>Search Location</h3>
            <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Enter location name"
            />
            <button onClick={handleSearchLocation}>Search</button>

            <h3>Select Location on Map</h3>
            
            <MapContainer center={[24.8607, 67.0011]} zoom={12} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <LocationMarker />
            </MapContainer>
        </div>
    );
};

export default RecyclingCenters;
