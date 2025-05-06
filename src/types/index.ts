
export type User = {
  id: string;
  email?: string;
  first_name: string;
  last_name: string;
  cin: string;
  phone: string;
  company_name: string;
  address: string;
  created_at?: string;
};

export type Admin = User & {
  // Admin specific fields can be added here
};

export type Developer = User & {
  assigned_vehicle_ids: string[];
  assigned_user_ids: string[];
  admin_uid: string;
};

export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  cin: string;
  phone: string;
  company_name: string;
  address: string;
  vehicle_id: string | null;
  admin_uid: string;
};

export type Location = {
  lat: number;
  lng: number;
  timestamp?: string;
};

export type Vehicle = {
  id: string;
  plate_number: string;
  status: 'active' | 'inactive' | 'maintenance';
  current_location: Location;
  history: Location[];
  admin_uid: string;
};

export type Alert = {
  id: string;
  vehicle_id: string;
  type: 'speeding' | 'geofence' | 'maintenance';
  description: string;
  timestamp: string;
};

export type UserRole = 'admin' | 'developer' | 'unassigned';
