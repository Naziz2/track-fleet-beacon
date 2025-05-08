
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Customer, User, Vehicle, mapUser } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Car, User as UserIcon, Plus, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DeveloperUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cin, setCin] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // First get the developer record to get assigned user IDs
        const { data: developerData, error: developerError } = await supabase
          .from('developers')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (developerError) throw developerError;
        
        if (developerData && developerData.assigned_user_ids?.length > 0) {
          const { assigned_user_ids, assigned_vehicle_ids } = developerData;
          
          // Fetch assigned users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .in('id', assigned_user_ids);
            
          if (userError) throw userError;
          
          const mappedUsers = (userData || []).map(mapUser);
          setUsers(mappedUsers);
          setFilteredUsers(mappedUsers);
          
          // Fetch assigned vehicles for the dropdown
          if (assigned_vehicle_ids?.length > 0) {
            const { data: vehicleData, error: vehicleError } = await supabase
              .from('vehicles')
              .select('*')
              .in('id', assigned_vehicle_ids);
              
            if (vehicleError) throw vehicleError;
            
            if (vehicleData) {
              setVehicles(vehicleData.map(mapVehicle));
            }
          }
        } else {
          setUsers([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
    
    // Set up subscription for real-time updates
    const usersSubscription = supabase
      .channel('users_channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
        const updatedUser = mapUser(payload.new as any);
        setUsers(prev => 
          prev.map(user => 
            user.id === updatedUser.id ? updatedUser : user
          )
        );
        setFilteredUsers(prev => 
          prev.map(user => 
            user.id === updatedUser.id ? updatedUser : user
          )
        );
      })
      .subscribe();
      
    // Cleanup subscription
    return () => {
      usersSubscription.unsubscribe();
    };
  }, [user]);
  
  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter((user) => 
          user.first_name.toLowerCase().includes(lowerCaseSearch) ||
          user.last_name.toLowerCase().includes(lowerCaseSearch) ||
          user.company_name.toLowerCase().includes(lowerCaseSearch) ||
          user.cin.toLowerCase().includes(lowerCaseSearch)
        )
      );
    }
  }, [searchTerm, users]);

  // Set form values when editing
  useEffect(() => {
    if (isEditing && selectedUser) {
      setFirstName(selectedUser.first_name);
      setLastName(selectedUser.last_name);
      setCin(selectedUser.cin);
      setPhone(selectedUser.phone);
      setCompanyName(selectedUser.company_name);
      setAddress(selectedUser.address);
      setVehicleId(selectedUser.vehicle_id);
    } else {
      // Reset form for new user
      setFirstName("");
      setLastName("");
      setCin("");
      setPhone("");
      setCompanyName("");
      setAddress("");
      setVehicleId(null);
    }
  }, [isEditing, selectedUser]);

  // Dialog open/close handlers
  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setIsEditing(true);
    } else {
      setSelectedUser(null);
      setIsEditing(false);
      // Reset form
      setFirstName("");
      setLastName("");
      setCin("");
      setPhone("");
      setCompanyName("");
      setAddress("");
      setVehicleId(null);
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
    
    setSubmitting(true);
    try {
      // First get the developer record to get admin_uid
      const { data: developerData, error: developerError } = await supabase
        .from('developers')
        .select('admin_uid')
        .eq('id', user.id)
        .single();
        
      if (developerError) throw developerError;
      
      if (!developerData?.admin_uid) {
        throw new Error("Admin connection not found");
      }
      
      const userData = {
        first_name: firstName,
        last_name: lastName,
        cin: cin,
        phone: phone,
        company_name: companyName,
        address: address,
        vehicle_id: vehicleId === "none" ? null : vehicleId,
        admin_uid: developerData.admin_uid
      };
      
      if (isEditing && selectedUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', selectedUser.id);
          
        if (error) throw error;
        
        toast.success("User updated successfully");
        
        // Update local state
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id ? { ...u, ...userData } : u
        ));
      } else {
        // Create new user
        const userId = crypto.randomUUID();
        const newUser = {
          id: userId,
          ...userData
        };
        
        const { error } = await supabase
          .from('users')
          .insert(newUser);
          
        if (error) throw error;
        
        // Update the developer's assigned_user_ids
        const { data: devData, error: devError } = await supabase
          .from('developers')
          .select('assigned_user_ids')
          .eq('id', user.id)
          .single();
        
        if (devError) throw devError;
            
        if (devData) {
          const { error: updateError } = await supabase
            .from('developers')
            .update({
              assigned_user_ids: [...(devData.assigned_user_ids || []), userId]
            })
            .eq('id', user.id);
            
          if (updateError) throw updateError;
        }
        
        toast.success("User created successfully");
        
        // Update local state
        const typedNewUser = newUser as User;
        setUsers(prev => [...prev, typedNewUser]);
        setFilteredUsers(prev => [...prev, typedNewUser]);
      }
      
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user", { 
        description: error.message 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Your Assigned Users</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search users..."
                className="w-full sm:w-[250px] pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {users.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="py-12 flex flex-col items-center">
                <UserIcon className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Users Assigned</h3>
                <p className="text-muted-foreground max-w-md">
                  You don't have any users assigned to you yet. Add your first user to get started.
                </p>
                <Button onClick={() => handleOpenDialog()} className="mt-6">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Users ({filteredUsers.length})</CardTitle>
              <CardDescription>
                List of all users assigned to you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>CIN</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.company_name}</TableCell>
                      <TableCell>{user.cin}</TableCell>
                      <TableCell>
                        {user.vehicle_id ? (
                          <Badge className="bg-green-500">
                            <Car className="h-3 w-3 mr-1" />
                            Assigned
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            No Vehicle
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(user)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update user information below"
                : "Fill in the details to create a new user"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cin">CIN</Label>
                <Input
                  id="cin"
                  value={cin}
                  onChange={(e) => setCin(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vehicle">Assign Vehicle</Label>
                <Select 
                  value={vehicleId || "none"} 
                  onValueChange={(value) => setVehicleId(value === "none" ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate_number} ({vehicle.model || ""}) - {vehicle.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Processing...' : isEditing ? 'Update User' : 'Add User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeveloperUsers;
