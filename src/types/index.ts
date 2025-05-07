
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
