
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Vehicle, Customer, Alert } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import VehicleMap from "@/components/VehicleMap";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Alert as AlertIcon, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<Customer[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeveloperData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // First get the developer record to get assigned vehicle and user IDs
        const { data: developerData, error: developerError } = await supabase
          .from('developers')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (developerError) throw developerError;
        
        if (developerData) {
          const { assigned_vehicle_ids, assigned_user_ids } = developerData;
          
          // Fetch assigned vehicles
          if (assigned_vehicle_ids && assigned_vehicle_ids.length > 0) {
            const { data: vehicleData, error: vehicleError } = await supabase
              .from('vehicles')
              .select('*')
              .in('id', assigned_vehicle_ids);
              
            if (vehicleError) throw vehicleError;
            setVehicles(vehicleData || []);
            
            // If we have vehicles, fetch alerts for them
            if (vehicleData && vehicleData.length > 0) {
              const vehicleIds = vehicleData.map(v => v.id);
              
              const { data: alertData, error: alertError } = await supabase
                .from('alerts')
                .select('*')
                .in('vehicle_id', vehicleIds)
                .order('timestamp', { ascending: false })
                .limit(5);
                
              if (alertError) throw alertError;
              setAlerts(alertData || []);
            }
          }
          
          // Fetch assigned users
          if (assigned_user_ids && assigned_user_ids.length > 0) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .in('id', assigned_user_ids);
              
            if (userError) throw userError;
            setUsers(userData || []);
          }
        }
      } catch (error) {
        console.error("Error fetching developer data:", error);
        toast.error("Failed to load your assigned resources");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeveloperData();
    
    // Set up subscription for real-time updates
    const vehiclesSubscription = supabase
      .channel('public:vehicles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'vehicles' }, (payload) => {
        const updatedVehicle = payload.new as Vehicle;
        setVehicles(prev => 
          prev.map(vehicle => 
            vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
          )
        );
      })
      .subscribe();
      
    const alertsSubscription = supabase
      .channel('public:alerts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
        const newAlert = payload.new as Alert;
        setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
        toast.info(`New alert: ${newAlert.type}`, {
          description: newAlert.description,
        });
      })
      .subscribe();
      
    // Cleanup subscriptions
    return () => {
      vehiclesSubscription.unsubscribe();
      alertsSubscription.unsubscribe();
    };
  }, [user]);

  const handleVehicleSelect = (id: string) => {
    setSelectedVehicleId(id);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading developer dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Developer Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back to your dashboard
        </div>
      </div>

      {/* Dashboard Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs text-fleet-600"
              onClick={() => navigate('/developer/vehicles')}
            >
              View all vehicles
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assigned Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs text-fleet-600"
              onClick={() => navigate('/developer/users')}
            >
              View all users
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicles.filter(v => v.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {vehicles.filter(v => v.status !== 'active').length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
            <AlertIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs text-fleet-600"
              onClick={() => navigate('/developer/alerts')}
            >
              View all alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="map">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="map">Vehicle Map</TabsTrigger>
          <TabsTrigger value="alerts">Recent Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map">
          {vehicles.length > 0 ? (
            <VehicleMap 
              vehicles={vehicles} 
              selectedVehicleId={selectedVehicleId}
              onVehicleSelect={handleVehicleSelect}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No vehicles assigned to you yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                The latest alerts from your assigned vehicles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-6">
                  {alerts.map(alert => {
                    const vehicle = vehicles.find(v => v.id === alert.vehicle_id);
                    const alertDate = new Date(alert.timestamp);
                    
                    return (
                      <div key={alert.id} className="border-b pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-medium">
                              {vehicle?.plate_number || 'Unknown Vehicle'}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {alertDate.toLocaleString()}
                            </p>
                          </div>
                          <Badge className={
                            alert.type === 'speeding' ? 'bg-red-500' :
                            alert.type === 'geofence' ? 'bg-amber-500' :
                            'bg-blue-500'
                          }>
                            {alert.type}
                          </Badge>
                        </div>
                        <p>{alert.description}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Lucide car icon component
const Car = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

export default DeveloperDashboard;
