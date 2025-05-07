
import { Json } from "@/integrations/supabase/types";

export type UserRole = 'admin' | 'developer' | 'unassigned';

export interface Location {
  lat: number;
  lng: number;
  timestamp?: string;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  status: 'active' | 'inactive' | 'maintenance';
  current_location: Location;
  history: Location[];
  admin_uid: string;
}

export interface Alert {
  id: string;
  vehicle_id: string;
  type: 'speeding' | 'geofence' | 'maintenance';
  description: string;
  timestamp: string;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  cin: string;
  phone: string;
  company_name: string;
  address: string;
  vehicle_id: string | null;
  admin_uid: string;
}

// Alias for User to maintain compatibility
export type Customer = User;

export interface Developer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  cin: string;
  phone: string;
  company_name: string;
  address: string;
  created_at: string;
  assigned_vehicle_ids: string[];
  assigned_user_ids: string[];
  admin_uid: string;
}

export interface Admin {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  cin: string;
  phone: string;
  company_name: string;
  address: string;
  created_at: string;
}

// Helper functions to convert database types to our interface types
export const mapVehicle = (dbVehicle: any): Vehicle => {
  return {
    id: dbVehicle.id,
    plate_number: dbVehicle.plate_number,
    status: dbVehicle.status as 'active' | 'inactive' | 'maintenance',
    current_location: parseLocation(dbVehicle.current_location),
    history: Array.isArray(dbVehicle.history) ? dbVehicle.history.map(parseLocation) : [],
    admin_uid: dbVehicle.admin_uid
  };
};

export const mapAlert = (dbAlert: any): Alert => {
  return {
    id: dbAlert.id,
    vehicle_id: dbAlert.vehicle_id,
    type: dbAlert.type as 'speeding' | 'geofence' | 'maintenance',
    description: dbAlert.description,
    timestamp: dbAlert.timestamp
  };
};

// Helper function to parse location data from any format
export const parseLocation = (location: any): Location => {
  if (typeof location === 'object' && location !== null) {
    if ('lat' in location && 'lng' in location) {
      return {
        lat: Number(location.lat),
        lng: Number(location.lng),
        timestamp: location.timestamp
      };
    }
  }
  
  try {
    // If it's a JSON string, try to parse it
    if (typeof location === 'string') {
      const parsed = JSON.parse(location);
      return {
        lat: Number(parsed.lat),
        lng: Number(parsed.lng),
        timestamp: parsed.timestamp
      };
    }
  } catch (e) {
    console.error("Failed to parse location:", e);
  }
  
  // Return default location if parsing fails
  return { lat: 0, lng: 0 };
};
