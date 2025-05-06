
import { useEffect, useRef } from "react";
import { Vehicle } from "@/types";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // Import Leaflet CSS

interface VehicleMapProps {
  vehicles: Vehicle[];
  selectedVehicleId?: string;
  onVehicleSelect?: (id: string) => void;
}

const VehicleMap = ({ vehicles, selectedVehicleId, onVehicleSelect }: VehicleMapProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    // Initialize map if it doesn't exist
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      mapRef.current = L.map(mapContainerRef.current).setView([33.5731, -7.5898], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Create custom marker icon
      const markerIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Create markers for vehicles on initial load
      vehicles.forEach(vehicle => {
        if (vehicle.current_location && typeof vehicle.current_location === 'object') {
          const { lat, lng } = vehicle.current_location;
          
          if (typeof lat === 'number' && typeof lng === 'number') {
            const marker = L.marker([lat, lng], { icon: markerIcon })
              .addTo(mapRef.current!)
              .bindPopup(`
                <b>${vehicle.plate_number}</b><br>
                Status: ${vehicle.status}<br>
                <button class="select-vehicle" data-id="${vehicle.id}">Select Vehicle</button>
              `);
              
            markersRef.current[vehicle.id] = marker;
            
            // Add event listeners to the popup content after it's added to the DOM
            marker.on('popupopen', () => {
              setTimeout(() => {
                const button = document.querySelector(`.select-vehicle[data-id="${vehicle.id}"]`);
                if (button && onVehicleSelect) {
                  // Using addEventListener instead of directly setting onclick
                  (button as HTMLElement).addEventListener('click', () => {
                    if (onVehicleSelect) {
                      onVehicleSelect(vehicle.id);
                    }
                  });
                }
              }, 10);
            });
          }
        }
      });

      // Set view to contain all markers if multiple vehicles
      if (vehicles.length > 1) {
        const latLngs = vehicles
          .filter(v => v.current_location && typeof v.current_location === 'object')
          .map(v => [v.current_location.lat, v.current_location.lng])
          .filter(coords => typeof coords[0] === 'number' && typeof coords[1] === 'number') as [number, number][];
          
        if (latLngs.length > 0) {
          mapRef.current.fitBounds(latLngs);
        }
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      toast.error("Failed to load map");
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when vehicles change
  useEffect(() => {
    if (!mapRef.current) return;

    // Create custom marker icon
    const markerIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const selectedMarkerIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Update or create markers
    vehicles.forEach(vehicle => {
      if (vehicle.current_location && typeof vehicle.current_location === 'object') {
        const { lat, lng } = vehicle.current_location;
        
        if (typeof lat === 'number' && typeof lng === 'number') {
          const icon = vehicle.id === selectedVehicleId ? selectedMarkerIcon : markerIcon;
          
          if (markersRef.current[vehicle.id]) {
            // Update existing marker
            markersRef.current[vehicle.id].setLatLng([lat, lng]);
            markersRef.current[vehicle.id].setIcon(icon);
            markersRef.current[vehicle.id].setPopupContent(`
              <b>${vehicle.plate_number}</b><br>
              Status: ${vehicle.status}<br>
              <button class="select-vehicle" data-id="${vehicle.id}">Select Vehicle</button>
            `);
          } else {
            // Create new marker
            const marker = L.marker([lat, lng], { icon })
              .addTo(mapRef.current!)
              .bindPopup(`
                <b>${vehicle.plate_number}</b><br>
                Status: ${vehicle.status}<br>
                <button class="select-vehicle" data-id="${vehicle.id}">Select Vehicle</button>
              `);
              
            markersRef.current[vehicle.id] = marker;
            
            // Add event listeners
            marker.on('popupopen', () => {
              setTimeout(() => {
                const button = document.querySelector(`.select-vehicle[data-id="${vehicle.id}"]`);
                if (button && onVehicleSelect) {
                  // Using addEventListener instead of directly setting onclick
                  (button as HTMLElement).addEventListener('click', () => {
                    if (onVehicleSelect) {
                      onVehicleSelect(vehicle.id);
                    }
                  });
                }
              }, 10);
            });
          }
          
          // If this is the selected vehicle, pan to it
          if (vehicle.id === selectedVehicleId) {
            mapRef.current!.setView([lat, lng], 15);
            markersRef.current[vehicle.id].openPopup();
          }
        }
      }
    });
    
    // Remove markers that no longer exist
    Object.keys(markersRef.current).forEach(id => {
      if (!vehicles.find(v => v.id === id)) {
        mapRef.current!.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });
  }, [vehicles, selectedVehicleId, onVehicleSelect]);

  return (
    <div className="h-[500px] md:h-[600px] lg:h-[700px] relative rounded-lg border shadow-sm overflow-hidden">
      <div ref={mapContainerRef} className="h-full w-full" />
    </div>
  );
};

export default VehicleMap;
