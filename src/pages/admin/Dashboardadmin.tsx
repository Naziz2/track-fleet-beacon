import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase"; 
import { Vehicle, Alert, mapVehicle, mapAlert } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleMap, MultiVehicleMap } from "@/components/VehicleMap";
import { Badge } from "@/components/ui/badge";
import { Car, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch vehicles managed by this admin
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('admin_uid', user.id);
          
        if (vehicleError) throw vehicleError;
        
        // Map the vehicles data using our helper function
        const mappedVehicles = (vehicleData || []).map(mapVehicle);
        setVehicles(mappedVehicles);
        
        // Fetch alerts for vehicles managed by this admin
        const { data: alertData, error: alertError } = await supabase
          .from('alerts')
          .select('*')
          .in('vehicle_id', mappedVehicles.map(v => v.id));
          
        if (alertError) throw alertError;
        
        // Map the alerts data using our helper function
        const mappedAlerts = (alertData || []).map(mapAlert);
        setAlerts(mappedAlerts);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up subscription for real-time updates on vehicles
    const vehiclesSubscription = supabase
      .channel('vehicles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const vehicle = mapVehicle(payload.new);
          setVehicles(prev => {
            const exists = prev.find(v => v.id === vehicle.id);
            if (exists) {
              return prev.map(v => v.id === vehicle.id ? vehicle : v);
            } else {
              return [...prev, vehicle];
            }
          });
        }
      })
      .subscribe();
      
    // Set up subscription for real-time updates on alerts
    const alertsSubscription = supabase
      .channel('alerts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const alert = mapAlert(payload.new);
          setAlerts(prev => [...prev, alert]);
        }
      })
      .subscribe();
    
    // Cleanup subscriptions
    return () => {
      vehiclesSubscription.unsubscribe();
      alertsSubscription.unsubscribe();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 p-4 bg-background rounded-xl shadow-md">
        <Car className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Full control and overview of your fleet, users, and developers</p>
        </div>
      </div>

      {/* Admin Stat Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
                <p className="text-3xl font-bold">{vehicles.length}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Car className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-3xl font-bold">{alerts.length}</p>
              </div>
              <div className="p-2 bg-destructive/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Placeholder for developers/users, replace with real data if available */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Developers</p>
                <p className="text-3xl font-bold">-</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Users</p>
                <p className="text-3xl font-bold">-</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Car className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fleet Summary</CardTitle>
          <CardDescription>
            Overview of your entire vehicle fleet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg bg-accent/40 flex flex-col items-center shadow-sm">
              <Car className="h-6 w-6 text-primary mb-2" />
              <div className="font-medium">Total Vehicles</div>
              <div className="text-3xl font-bold">{vehicles.length}</div>
            </div>
            <div className="p-6 rounded-lg bg-green-100 flex flex-col items-center shadow-sm">
              <Car className="h-6 w-6 text-green-600 mb-2" />
              <div className="font-medium">Active Vehicles</div>
              <div className="text-3xl font-bold text-green-700">
                {vehicles.filter((vehicle) => vehicle.status === 'active').length}
              </div>
            </div>
            <div className="p-6 rounded-lg bg-red-100 flex flex-col items-center shadow-sm">
              <Car className="h-6 w-6 text-red-600 mb-2" />
              <div className="font-medium">Inactive Vehicles</div>
              <div className="text-3xl font-bold text-red-700">
                {vehicles.filter((vehicle) => vehicle.status === 'inactive').length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map + Vehicle List section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-2">
        {/* Map and vehicle list side by side on desktop */}
        <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>Fleet Map</CardTitle>
                <CardDescription>
                  All vehicles visualized on a single map
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vehicles.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No vehicles found.</p>
                  </div>
                ) : (
                  <div className="h-[350px] w-full rounded-lg border overflow-hidden">
                    <MultiVehicleMap 
                      vehicles={vehicles}
                      selectedVehicleId={selectedVehicleId}
                      onVehicleSelect={setSelectedVehicleId}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Vehicle List */}
          <div className="w-full md:w-60">
            <Card className="h-[350px] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-base">Vehicles</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {vehicles.map(vehicle => (
                    <li
                      key={vehicle.id}
                      className={`px-4 py-3 cursor-pointer flex items-center gap-2 hover:bg-accent/40 transition-colors ${selectedVehicleId === vehicle.id ? 'bg-primary/10 font-semibold' : ''}`}
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      title={`Focus map on ${vehicle.plate_number}`}
                    >
                      <Car className="h-4 w-4 text-primary" />
                      <span>{vehicle.plate_number}</span>
                      <Badge
                        variant={vehicle.status === 'active' ? 'default' : 'secondary'}
                        className={`ml-auto ${vehicle.status === 'active' ? 'bg-green-100 text-green-700 border-green-300' : ''}`}
                      >
                        {vehicle.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Alerts Box */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Latest alerts from your vehicles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No recent alerts.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="rounded-lg">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert) => {
                        const vehicle = vehicles.find(v => v.id === alert.vehicle_id);
                        return (
                          <TableRow key={alert.id} className="hover:bg-accent/40 transition-colors">
                            <TableCell className="font-medium">
                              {vehicle ? vehicle.plate_number : "Unknown"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive" className="gap-1.5" title={alert.type}>
                                <AlertTriangle className="h-3 w-3" />
                                {alert.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{alert.description}</TableCell>
                            <TableCell>
                              {new Date(alert.timestamp).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
