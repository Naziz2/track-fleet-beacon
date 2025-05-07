import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Plus, Trash, Edit, Car } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<Customer[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cin, setCin] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  
  // Available vehicles
  const [availableVehicles, setAvailableVehicles] = useState<{id: string, plate_number: string}[]>([]);
  
  // Fetch users and vehicles
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch users managed by this admin
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('admin_uid', user.id);
          
        if (userError) throw userError;
        
        setUsers(userData || []);
        setFilteredUsers(userData || []);
        
        // Fetch available vehicles
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('id, plate_number')
          .eq('admin_uid', user.id);
          
        if (vehicleError) throw vehicleError;
        
        setAvailableVehicles(vehicleData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load users and vehicles");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up subscription for real-time updates
    const usersSubscription = supabase
      .channel('users_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const user = payload.new as Customer;
          if (user.admin_uid === user?.id) {
            setUsers(prev => {
              const exists = prev.find(u => u.id === user.id);
              if (exists) {
                return prev.map(u => u.id === user.id ? user : u);
              } else {
                return [...prev, user];
              }
            });
            setFilteredUsers(prev => {
              const exists = prev.find(u => u.id === user.id);
              if (exists) {
                return prev.map(u => u.id === user.id ? user : u);
              } else {
                if (searchTerm.trim() === '') {
                  return [...prev, user];
                }
                return prev;
              }
            });
          }
        } else if (payload.eventType === 'DELETE') {
          const deletedUser = payload.old as Customer;
          setUsers(prev => prev.filter(u => u.id !== deletedUser.id));
          setFilteredUsers(prev => prev.filter(u => u.id !== deletedUser.id));
        }
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
      resetForm();
    }
  }, [isEditing, selectedUser]);
  
  // Reset the form
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setCin("");
    setPhone("");
    setCompanyName("");
    setAddress("");
    setVehicleId(null);
  };
  
  // Dialog open/close handlers
  const handleOpenDialog = (user?: Customer) => {
    if (user) {
      setSelectedUser(user);
      setIsEditing(true);
    } else {
      setSelectedUser(null);
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
      // Prepare user data
      const userData = {
        first_name: firstName,
        last_name: lastName,
        cin: cin,
        phone: phone,
        company_name: companyName,
        address: address,
        vehicle_id: vehicleId,
        admin_uid: user.id
      };
      
      if (isEditing && selectedUser) {
        // Update existing user
        const { error } = await supabase
          .from('users')
          .update(userData)
          .eq('id', selectedUser.id);
          
        if (error) throw error;
        
        toast.success("User updated successfully");
      } else {
        // Create new user with a UUID
        const { data: idData } = await supabase.rpc('generate_uuid');
        const newId = idData as string;
        
        // Create new user with the generated UUID
        const { data, error } = await supabase
          .from('users')
          .insert({
            id: newId,
            ...userData
          })
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          toast.success("User added successfully");
        }
      }
      
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error("Failed to save user", { 
        description: error.message 
      });
    }
  };
  
  // Handle delete
  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }
    
    try {
      // Delete the user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
        
      if (error) throw error;
      
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };
  
  // Get vehicle plate number by ID
  const getVehiclePlate = (vehicleId: string | null) => {
    if (!vehicleId) return 'None';
    const vehicle = availableVehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.plate_number : 'Unknown';
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
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
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
              <p className="text-muted-foreground py-8">No users found. Add your first user to get started.</p>
              <Button onClick={() => handleOpenDialog()} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage your customer accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>CIN</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Assigned Vehicle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell>{user.cin}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.company_name}</TableCell>
                      <TableCell>
                        {user.vehicle_id ? (
                          <Badge variant="outline" className="bg-gray-100 flex items-center w-fit">
                            <Car className="h-3 w-3 mr-1" />
                            {getVehiclePlate(user.vehicle_id)}
                          </Badge>
                        ) : (
                          <span className="text-gray-500 text-sm">None</span>
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
                            <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(user.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                ? "Update the user details below."
                : "Fill in the details for the new user."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="first-name" className="text-right">
                  First name
                </Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="last-name" className="text-right">
                  Last name
                </Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cin" className="text-right">
                  CIN
                </Label>
                <Input
                  id="cin"
                  value={cin}
                  onChange={(e) => setCin(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="vehicle" className="text-right">
                  Vehicle
                </Label>
                <Select 
                  value={vehicleId || undefined} 
                  onValueChange={(value) => setVehicleId(value || null)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a vehicle (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{isEditing ? 'Update User' : 'Add User'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminUsers;
