
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Vehicle } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import VehicleMap from "@/components/VehicleMap";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DeveloperVehicles = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch vehicles assigned to this developer
  useEffect(() => {
    const fetchVehicles = async () => {
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
          
          // Fetch assigned vehicles
          const { data: vehicleData, error: vehicleError } = await supabase
            .from('vehicles')
            .select('*')
            .in('id', assigned_vehicle_ids);
            
          if (vehicleError) throw vehicleError;
          
          const vehicles = vehicleData || [];
          setVehicles(vehicles);
          setFilteredVehicles(vehicles);
        } else {
          setVehicles([]);
          setFilteredVehicles([]);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        toast.error("Failed to load vehicles");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVehicles();
    
    // Set up subscription for real-time updates
    const vehiclesSubscription = supabase
      .channel('vehicles_channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'vehicles' }, (payload) => {
        const updatedVehicle = payload.new as Vehicle;
        setVehicles(prev => 
          prev.map(vehicle => 
            vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
          )
        );
        setFilteredVehicles(prev => 
          prev.map(vehicle => 
            vehicle.id === updatedVehicle.id ? updatedVehicle : vehicle
          )
        );
        
        // If this is the selected vehicle, update it
        if (selectedVehicle && selectedVehicle.id === updatedVehicle.id) {
          setSelectedVehicle(updatedVehicle);
        }
        
        toast.info(`Vehicle ${updatedVehicle.plate_number} updated`);
      })
      .subscribe();
      
    // Cleanup subscription
    return () => {
      vehiclesSubscription.unsubscribe();
    };
  }, [user]);
  
  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredVehicles(vehicles);
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      setFilteredVehicles(
        vehicles.filter((vehicle) => 
          vehicle.plate_number.toLowerCase().includes(lowerCaseSearch) ||
          vehicle.status.toLowerCase().includes(lowerCaseSearch)
        )
      );
    }
  }, [searchTerm, vehicles]);
  
  // Update selected vehicle when selected ID changes
  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId) || null;
      setSelectedVehicle(vehicle);
    } else {
      setSelectedVehicle(null);
    }
  }, [selectedVehicleId, vehicles]);
  
  const handleVehicleSelect = (id: string) => {
    setSelectedVehicleId(id);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Your Assigned Vehicles</h1>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search vehicles..."
            className="w-full sm:w-[250px] pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground py-8">No vehicles are currently assigned to you.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="map">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <VehicleMap 
                  vehicles={filteredVehicles} 
                  selectedVehicleId={selectedVehicleId}
                  onVehicleSelect={handleVehicleSelect}
                />
              </div>
              <div>
                {selectedVehicle ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedVehicle.plate_number}</CardTitle>
                      <CardDescription>Vehicle Details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">Status</span>
                          <Badge className={
                            selectedVehicle.status === 'active' ? 'bg-green-500' :
                            selectedVehicle.status === 'maintenance' ? 'bg-amber-500' :
                            'bg-red-500'
                          }>
                            {selectedVehicle.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">Current Location</span>
                          <span>
                            {selectedVehicle.current_location.lat.toFixed(6)}, 
                            {selectedVehicle.current_location.lng.toFixed(6)}
                          </span>
                        </div>
                        
                        <h4 className="font-medium mt-4 mb-2">Location History</h4>
                        <div className="max-h-[300px] overflow-y-auto border rounded-md p-3">
                          {selectedVehicle.history && selectedVehicle.history.length > 0 ? (
                            <div className="space-y-2">
                              {selectedVehicle.history.map((location, index) => (
                                <div key={index} className="text-sm pb-2 border-b last:border-0">
                                  <div className="flex justify-between">
                                    <span className="font-medium">{index + 1}.</span>
                                    <span className="text-gray-500">
                                      {location.timestamp ? formatDate(location.timestamp) : 'No timestamp'}
                                    </span>
                                  </div>
                                  <div className="mt-1">
                                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 py-4">No history available</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Select a vehicle on the map to view details</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Vehicles ({filteredVehicles.length})</CardTitle>
                <CardDescription>
                  List of all vehicles assigned to you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plate Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Location</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">
                          {vehicle.plate_number}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            vehicle.status === 'active' ? 'bg-green-500' :
                            vehicle.status === 'maintenance' ? 'bg-amber-500' :
                            'bg-red-500'
                          }>
                            {vehicle.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {vehicle.current_location.lat.toFixed(6)}, 
                          {vehicle.current_location.lng.toFixed(6)}
                        </TableCell>
                        <TableCell>
                          {vehicle.history && vehicle.history.length > 0 && vehicle.history[0].timestamp
                            ? formatDate(vehicle.history[0].timestamp)
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedVehicleId(vehicle.id);
                              // Switch to map view when selecting a vehicle
                              document.querySelector('[data-state="inactive"][value="map"]')?.click();
                            }}
                          >
                            View on Map
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DeveloperVehicles;
