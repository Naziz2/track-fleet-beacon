
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Vehicle, Location, parseLocation } from "@/types";

// Fix default marker icon issue in Leaflet
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Override default Leaflet marker icons
const defaultIcon = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Custom Icons
const activeVehicleIcon = L.icon({
  iconUrl: '/images/active-vehicle-marker.png',
  iconRetinaUrl: '/images/active-vehicle-marker.png',
  shadowUrl: null,
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [0, -48],
});

const historyMarkerIcon = L.icon({
  iconUrl: '/images/history-marker.png',
  iconRetinaUrl: '/images/history-marker.png',
  shadowUrl: null,
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [0, -32],
});

function MapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [map, center]);

  return null;
}

interface VehicleMapProps {
  vehicle: Vehicle;
  showHistory?: boolean;
}

export const VehicleMap = ({ vehicle, showHistory = false }: VehicleMapProps) => {
  // Process the current_location to ensure it's in the right format
  const currentLocation = parseLocation(vehicle.current_location);
  
  // Process the history locations
  const historyLocations = vehicle.history
    ?.map(loc => parseLocation(loc))
    .filter(loc => loc.lat !== 0 && loc.lng !== 0) || [];
  
  return (
    <div className="h-full min-h-[300px] w-full rounded-md border">
      <MapContainer
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={13}
        className="h-full w-full rounded-md"
      >
        <MapView center={[currentLocation.lat, currentLocation.lng]} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Show current vehicle location */}
        <Marker 
          position={[currentLocation.lat, currentLocation.lng]} 
          icon={activeVehicleIcon}
        >
          <Popup>
            <div>
              <p className="font-bold">{vehicle.plate_number}</p>
              <p>Current Location</p>
            </div>
          </Popup>
        </Marker>
        
        {/* Show history if enabled */}
        {showHistory && historyLocations.map((location, index) => (
          <Marker
            key={index}
            position={[location.lat, location.lng]}
            icon={historyMarkerIcon}
          >
            <Popup>
              <div>
                <p className="font-bold">{vehicle.plate_number}</p>
                <p>History Point {index + 1}</p>
                {location.timestamp && (
                  <p>{new Date(location.timestamp).toLocaleString()}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
