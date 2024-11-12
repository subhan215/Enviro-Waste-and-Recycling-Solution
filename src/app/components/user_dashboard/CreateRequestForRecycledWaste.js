import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

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

function CreateRequestForRecycledWaste() {
    const [waste, setWaste] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [locationName, setLocationName] = useState('');
    const [map, setMap] = useState(null);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [requestData, setRequestData] = useState({
        waste: '',
        preferredDate: '',
        preferredTime: '',
        latitude: '',
        longitude: ''
    });
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the default form submission behavior
        
        try {
            const response = await axios.post('/api/requests/request_for_recycled_waste', {
                waste,
                preferredDate,
                preferredTime,
                latitude: requestData.latitude,
                longitude: requestData.longitude,
                userId: 2
            });
    
            if (response.data.success) {
                setSuccessMessage('Request submitted successfully!');
                setWaste('');
                setPreferredDate('');
                setPreferredTime('');
                setLocationName('');
                setRequestData({
                    waste: '',
                    preferredDate: '',
                    preferredTime: '',
                    latitude: '',
                    longitude: ''
                });
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };
    
    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                const { lat, lng } = e.latlng;
                setRequestData(prev => ({ ...prev, latitude: lat, longitude: lng }));
            }
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
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&bounded=1&viewbox=${karachiBounds.northEast.lon},${karachiBounds.northEast.lat},${karachiBounds.southWest.lon},${karachiBounds.southWest.lat}`
            );

            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                setRequestData(prev => ({ ...prev, latitude: lat, longitude: lon }));

                if (map) {
                    map.setView([lat, lon], 14);
                }
            } else {
                setError('Location not found');
            }
        } catch (err) {
            setError('Error searching for location');
        }
    };

    return (
        <div>
            <h2>Create Request for Recycled Waste</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="waste">Waste Weight:</label>
                    <input
                        type="text"
                        id="waste"
                        value={waste}
                        onChange={(e) => setWaste(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="preferredDate">Preferred Date:</label>
                    <input
                        type="date"
                        id="preferredDate"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="preferredTime">Preferred Time:</label>
                    <input
                        type="time"
                        id="preferredTime"
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create Request</button>
                {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <h3>Search Location</h3>
                <input
                    type="text"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Enter location name"
                />
                <button type="button" onClick={handleSearchLocation}>Search</button>

                <h3>Select Location on Map</h3>
                <MapContainer
                    center={[24.8607, 67.0011]}
                    zoom={12}
                    style={{ height: '400px', width: '100%' }}
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
    );
}

export default CreateRequestForRecycledWaste;
