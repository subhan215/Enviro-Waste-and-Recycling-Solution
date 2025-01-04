import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { useMapEvents, TileLayer, Marker } from 'react-leaflet';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });

const MapComponent = ({ setCoordinates }) => {
    const [markerPosition, setMarkerPosition] = useState(null);
    const [locationName, setLocationName] = useState('');
    const [map, setMap] = useState(null);

    // Function to handle location search
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
                setMarkerPosition([lat, lon]);
                setCoordinates({ latitude: lat, longitude: lon });

                if (map) {
                    map.setView([lat, lon], 14);
                }
            } else {
                alert('Location not found');
            }
        } catch {
            alert('Error searching for location');
        }
    };

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setMarkerPosition([lat, lng]);
            setCoordinates({ latitude: lat, longitude: lng });
        },
        load(mapInstance) {
            setMap(mapInstance);
        }
    });

    return (
        <div>
            <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Enter location name"
            />
            <button onClick={handleSearchLocation}>Search</button>
            <MapContainer center={[24.8607, 67.0011]} zoom={12} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                {markerPosition && <Marker position={markerPosition} />}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
