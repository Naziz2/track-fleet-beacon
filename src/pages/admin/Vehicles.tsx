
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Vehicle, mapVehicle, Developer } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Plus, Trash, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { VehicleMap, MultiVehicleMap } from "@/components/VehicleMap";

const AdminVehicles = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  
  // Form state
  const [plateNumber, setPlateNumber] = useState("");
  const [model, setModel] = useState("");
  const [vehicleType, setVehicleType] = useState("car");
  const [status, setStatus] = useState<'active' | 'inactive' | 'maintenance'>('active');
  const [currentLocation, setCurrentLocation] = useState({
    lat: 33.5731,
    lng: -7.5898
  });
  const [assignedDevelopers, setAssignedDevelopers] = useState<string[]>([]);
  
  // Mode for the map view (view or add)
  const [mapMode, setMapMode] = useState<'view' | 'add'>('view');
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedVehicleForMap, setSelectedVehicleForMap] = useState<string | undefined>(undefined);
  
  // Fetch vehicles and developers
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('admin_uid', user.id);
          
        if (error) throw error;
        
        // Convert supabase data to our Vehicle type using the mapVehicle helper
        const mappedData = (data || []).map(mapVehicle);
        setVehicles(mappedData);
        setFilteredVehicles(mappedData);

        // Fetch developers
        const { data: developerData, error: developerError } = await supabase
          .from('developers')
          .select('*')
          .eq('admin_uid', user.id);
          
        if (developerError) throw developerError;
        
        setDevelopers(developerData || []);
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
      .channel('vehicles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
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
        } else if (payload.eventType === 'INSERT') {
          const newVehicle = payload.new as Vehicle;
          if (newVehicle.admin_uid === user?.id) {
            setVehicles(prev => [...prev, newVehicle]);
            setFilteredVehicles(prev => [...prev, newVehicle]);
          }
        } else if (payload.eventType === 'DELETE') {
          const deletedVehicle = payload.old as Vehicle;
          setVehicles(prev => prev.filter(v => v.id !== deletedVehicle.id));
          setFilteredVehicles(prev => prev.filter(v => v.id !== deletedVehicle.id));
        }
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
  
  // Set form values when editing
  useEffect(() => {
    if (isEditing && selectedVehicle) {
      setPlateNumber(selectedVehicle.plate_number);
      setModel(selectedVehicle.model || "");
      setVehicleType(selectedVehicle.type || "car");
      setStatus(selectedVehicle.status);
      setCurrentLocation(selectedVehicle.current_location);
      
      // Get assigned developers for this vehicle
      const assigned = developers
        .filter(d => d.assigned_vehicle_ids?.includes(selectedVehicle.id))
        .map(d => d.id);
      
      setAssignedDevelopers(assigned);
    } else {
      resetForm();
    }
  }, [isEditing, selectedVehicle, developers]);
  
  // Reset the form
  const resetForm = () => {
    setPlateNumber("");
    setModel("");
    setVehicleType("car");
    setStatus('active');
    setCurrentLocation({
      lat: 33.5731,
      lng: -7.5898
    });
    setAssignedDevelopers([]);
  };
  
  // Dialog open/close handlers
  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setIsEditing(true);
    } else {
      setSelectedVehicle(null);
      setIsEditing(false);
      resetForm();
    }
    setDialogOpen(true);
  };
  
  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to perform this action");
      return;
    }
    
    try {
      if (isEditing && selectedVehicle) {
        // Update existing vehicle
        const { error } = await supabase
          .from('vehicles')
          .update({
            plate_number: plateNumber,
            model: model,
            type: vehicleType,
            status,
            current_location: currentLocation,
          })
          .eq('id', selectedVehicle.id);
          
        if (error) throw error;
        
        toast.success("Vehicle updated successfully");
      } else {
        // Create new vehicle
        const vehicleId = crypto.randomUUID();
        const { error } = await supabase
          .from('vehicles')
          .insert({
            id: vehicleId,
            plate_number: plateNumber,
            model: model,
            type: vehicleType,
            status,
            current_location: currentLocation,
            history: [{ ...currentLocation, timestamp: new Date().toISOString() }],
            admin_uid: user.id
          });
          
        if (error) throw error;
        
        toast.success("Vehicle added successfully");
        
        // If developers are assigned, update them
        if (assignedDevelopers.length > 0) {
          await updateDeveloperAssignments(vehicleId);
        }
      }
      
      // For editing, update developer assignments
      if (isEditing && selectedVehicle) {
        await updateDeveloperAssignments(selectedVehicle.id);
      }
      
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving vehicle:", error);
      toast.error("Failed to save vehicle");
    }
  };
  
  // Update developer assignments for a vehicle
  const updateDeveloperAssignments = async (vehicleId: string) => {
    try {
      // For each developer
      for (const developer of developers) {
        const hasVehicle = developer.assigned_vehicle_ids?.includes(vehicleId);
        const shouldHaveVehicle = assignedDevelopers.includes(developer.id);
        
        if (hasVehicle && !shouldHaveVehicle) {
          // Remove vehicle from developer
          const updatedIds = (developer.assigned_vehicle_ids || []).filter(id => id !== vehicleId);
          await supabase
            .from('developers')
            .update({ assigned_vehicle_ids: updatedIds })
            .eq('id', developer.id);
        } else if (!hasVehicle && shouldHaveVehicle) {
          // Add vehicle to developer
          const updatedIds = [...(developer.assigned_vehicle_ids || []), vehicleId];
          await supabase
            .from('developers')
            .update({ assigned_vehicle_ids: updatedIds })
            .eq('id', developer.id);
        }
      }
    } catch (error) {
      console.error("Error updating developer assignments:", error);
      toast.error("Failed to update developer assignments");
    }
  };
  
  // Handle delete
  const handleDelete = async (vehicleId: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) {
      return;
    }
    
    try {
      // Remove vehicle from all developers first
      for (const developer of developers) {
        if (developer.assigned_vehicle_ids?.includes(vehicleId)) {
          const updatedIds = developer.assigned_vehicle_ids.filter(id => id !== vehicleId);
          await supabase
            .from('developers')
            .update({ assigned_vehicle_ids: updatedIds })
            .eq('id', developer.id);
        }
      }
      
      // Delete the vehicle
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);
        
      if (error) throw error;
      
      toast.success("Vehicle deleted successfully");
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      toast.error("Failed to delete vehicle");
    }
  };
  
  // Open map view for a specific vehicle
  const handleOpenMap = (vehicleId: string) => {
    setSelectedVehicleForMap(vehicleId);
    setMapMode('view');
    setMapDialogOpen(true);
  };
  
  // Open map to add a location
  const handleOpenLocationPicker = () => {
    setMapMode('add');
    setMapDialogOpen(true);
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
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Vehicle Management</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search vehicles..."
                className="w-full sm:w-[250px] pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground py-8">No vehicles found. Add your first vehicle to get started.</p>
              <Button onClick={() => handleOpenDialog()} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Vehicles</CardTitle>
              <CardDescription>
                Manage your company vehicles and their assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate Number</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => {
                    // Find developers assigned to this vehicle
                    const assignedDevs = developers.filter(
                      (dev) => dev.assigned_vehicle_ids?.includes(vehicle.id)
                    );
                    
                    return (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.plate_number}</TableCell>
                        <TableCell>{vehicle.model || "—"}</TableCell>
                        <TableCell>{vehicle.vehicle_type || "Car"}</TableCell>
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
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto"
                            onClick={() => handleOpenMap(vehicle.id)}
                          >
                            View Map
                          </Button>
                        </TableCell>
                        <TableCell>
                          {assignedDevs.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assignedDevs.map((dev) => (
                                <Badge key={dev.id} variant="outline" className="bg-gray-100">
                                  {dev.first_name} {dev.last_name}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDialog(vehicle)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(vehicle.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Vehicle Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the vehicle details below."
                : "Fill in the details for the new vehicle."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="plate-number" className="text-right">
                  Plate Number
                </Label>
                <Input
                  id="plate-number"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model" className="text-right">
                  Model
                </Label>
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select 
                  value={vehicleType} 
                  onValueChange={(value) => setVehicleType(value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={status} 
                  onValueChange={(value) => setStatus(value as 'active' | 'inactive' | 'maintenance')}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Location</Label>
                <div className="col-span-3 flex gap-2 items-center">
                  <div className="grid gap-1">
                    <Label htmlFor="lat" className="text-xs">Latitude</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="0.000001"
                      value={currentLocation.lat}
                      onChange={(e) => setCurrentLocation({
                        ...currentLocation,
                        lat: parseFloat(e.target.value) || 0
                      })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="lng" className="text-xs">Longitude</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="0.000001"
                      value={currentLocation.lng}
                      onChange={(e) => setCurrentLocation({
                        ...currentLocation,
                        lng: parseFloat(e.target.value) || 0
                      })}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-auto"
                    onClick={handleOpenLocationPicker}
                  >
                    Pick
                  </Button>
                </div>
              </div>
              
              {developers.length > 0 && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">Assign To</Label>
                  <div className="col-span-3 space-y-2">
                    {developers.map((developer) => (
                      <div key={developer.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`developer-${developer.id}`}
                          checked={assignedDevelopers.includes(developer.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setAssignedDevelopers([...assignedDevelopers, developer.id]);
                            } else {
                              setAssignedDevelopers(
                                assignedDevelopers.filter(id => id !== developer.id)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`developer-${developer.id}`} className="text-sm font-normal">
                          {developer.first_name} {developer.last_name} ({developer.email})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit">{isEditing ? 'Update Vehicle' : 'Add Vehicle'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Map Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mapMode === 'view' 
                ? 'Vehicle Location' 
                : 'Pick Vehicle Location'}
            </DialogTitle>
          </DialogHeader>
          <div className="h-[500px]">
            <MultiVehicleMap 
              vehicles={
                mapMode === 'view' && selectedVehicleForMap
                  ? vehicles.filter(v => v.id === selectedVehicleForMap)
                  : []
              }
              selectedVehicleId={selectedVehicleForMap}
            />
          </div>
          {mapMode === 'add' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Click on the map to select a location
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="map-lat">Latitude</Label>
                  <Input
                    id="map-lat"
                    value={currentLocation.lat}
                    onChange={(e) => setCurrentLocation({
                      ...currentLocation,
                      lat: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="map-lng">Longitude</Label>
                  <Input
                    id="map-lng"
                    value={currentLocation.lng}
                    onChange={(e) => setCurrentLocation({
                      ...currentLocation,
                      lng: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
              <Button className="mt-4" onClick={() => setMapDialogOpen(false)}>
                Confirm Location
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminVehicles;
