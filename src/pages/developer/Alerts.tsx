import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Alert, Vehicle, mapAlert, mapVehicle } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, Bell, Car } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DeveloperAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<{ [key: string]: Vehicle }>({});
  const [filterType, setFilterType] = useState<string>("all");
  
  // Fetch alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // First get the developer record to get assigned vehicle IDs
        const { data: developerData, error: developerError } = await supabase
          .from('developers')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (developerError) throw developerError;
        
        if (developerData && developerData.assigned_vehicle_ids?.length > 0) {
          const { assigned_vehicle_ids } = developerData;
          
          // Fetch vehicles
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .in('id', assigned_vehicle_ids);
            
          if (vehicleError) throw vehicleError;
          
          // Map the vehicles data using our helper function
          const mappedVehicles = (vehicleData || []).map(mapVehicle);
          setVehicles(mappedVehicles);
          
          // Fetch alerts for these vehicles
          const { data: alertData, error: alertError } = await supabase
            .from('alerts')
            .select('*')
            .in('vehicle_id', assigned_vehicle_ids)
            .order('timestamp', { ascending: false });
            
          if (alertError) throw alertError;
          
          // Map the alerts data using our helper function
          const mappedAlerts = (alertData || []).map(mapAlert);
          setAlerts(mappedAlerts);
          setFilteredAlerts(mappedAlerts);
        } else {
          setAlerts([]);
          setFilteredAlerts([]);
        }
      } catch (error) {
        console.error("Error fetching alerts:", error);
        toast.error("Failed to load alerts");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAlerts();
    
    // Set up subscription for real-time updates
    const alertsSubscription = supabase
      .channel('alerts_channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, (payload) => {
        const newAlert = payload.new as Alert;
        
        // Check if this alert belongs to one of our vehicles
        if (vehicles[newAlert.vehicle_id]) {
          setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
          
          // Apply filters if needed
          if (filterType === 'all' || filterType === newAlert.type) {
            setFilteredAlerts(prevAlerts => [newAlert, ...prevAlerts]);
          }
          
          // Show notification
          const vehiclePlate = vehicles[newAlert.vehicle_id]?.plate_number || 'Unknown Vehicle';
          toast.error(`New Alert: ${newAlert.type}`, {
            description: `${vehiclePlate}: ${newAlert.description}`,
          });
        }
      })
      .subscribe();
      
    // Cleanup subscription
    return () => {
      alertsSubscription.unsubscribe();
    };
  }, [user]);
  
  // Handle search and filtering
  useEffect(() => {
    let filtered = alerts;
    
    // Filter by type if not "all"
    if (filterType !== "all") {
      filtered = filtered.filter(alert => alert.type === filterType);
    }
    
    // Then apply search term if any
    if (searchTerm.trim() !== "") {
      const lowerCaseSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((alert) => {
        const vehiclePlate = vehicles[alert.vehicle_id]?.plate_number?.toLowerCase() || '';
        return (
          alert.description.toLowerCase().includes(lowerCaseSearch) ||
          alert.type.toLowerCase().includes(lowerCaseSearch) ||
          vehiclePlate.includes(lowerCaseSearch)
        );
      });
    }
    
    setFilteredAlerts(filtered);
  }, [searchTerm, filterType, alerts, vehicles]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Get alert type badge color
  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'speeding':
        return 'bg-red-500';
      case 'geofence':
        return 'bg-amber-500';
      case 'maintenance':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Vehicle Alerts</h1>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search alerts..."
              className="w-full sm:w-[250px] pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="speeding">Speeding</SelectItem>
              <SelectItem value="geofence">Geofence</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="py-12 flex flex-col items-center">
              <Bell className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Alerts Found</h3>
              <p className="text-muted-foreground max-w-md">
                There are no alerts for your assigned vehicles. We'll notify you when new alerts come in.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="py-8">
              <p className="text-muted-foreground">No alerts match your current filters.</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Alert History</CardTitle>
            <CardDescription>
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.map((alert) => {
                  const vehicle = vehicles[alert.vehicle_id];
                  return (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <Badge className={getAlertBadgeColor(alert.type)}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Car className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{vehicle ? vehicle.plate_number : "Unknown Vehicle"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{alert.description}</TableCell>
                      <TableCell>{formatDate(alert.timestamp)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeveloperAlerts;
