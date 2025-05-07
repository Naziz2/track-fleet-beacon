import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase"; 
import { Vehicle, Alert, mapVehicle, mapAlert } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleMap } from "@/components/VehicleMap";
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicles Overview</CardTitle>
            <CardDescription>
              Summary of your fleet status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vehicles.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No vehicles found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="space-y-2">
                    <h3 className="text-lg font-semibold">{vehicle.plate_number}</h3>
                    <VehicleMap vehicle={vehicle} />
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{vehicle.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
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
              <Table>
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
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">
                          {vehicle ? vehicle.plate_number : "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="gap-1.5">
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
            )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-md bg-muted">
              <div className="font-medium">Total Vehicles</div>
              <div className="text-2xl font-bold">{vehicles.length}</div>
            </div>
            <div className="p-4 rounded-md bg-muted">
              <div className="font-medium">Active Vehicles</div>
              <div className="text-2xl font-bold">
                {vehicles.filter((vehicle) => vehicle.status === 'active').length}
              </div>
            </div>
            <div className="p-4 rounded-md bg-muted">
              <div className="font-medium">Inactive Vehicles</div>
              <div className="text-2xl font-bold">
                {vehicles.filter((vehicle) => vehicle.status === 'inactive').length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
