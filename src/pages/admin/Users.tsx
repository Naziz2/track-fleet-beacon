
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  MoreVertical, Search, Plus, Trash2, Edit, UserPlus, Check, X, UserX,
  CircleSlash, CheckCircle, UserCog
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

// User type definition
interface User {
  id: string;
  first_name: string;
  last_name: string;
  cin: string;
  address: string;
  phone: string;
  company_name: string;
  vehicle_id: string | null;
  admin_uid: string;
  email?: string;
}

// Developer type definition
interface Developer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  assigned_user_ids: string[];
}

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [cinNumber, setCinNumber] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [selectedDeveloper, setSelectedDeveloper] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchDevelopers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // If admin is logged in, fetch users linked to this admin
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('admin_uid', user?.id);
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error.message);
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDevelopers = async () => {
    try {
      // If admin is logged in, fetch developers linked to this admin
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('admin_uid', user?.id);
      
      if (error) throw error;
      
      setDevelopers(data || []);
    } catch (error: any) {
      console.error('Error fetching developers:', error.message);
      toast({
        title: "Error fetching developers",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const errors: Record<string, string> = {};
    if (!firstName) errors.firstName = 'First name is required';
    if (!lastName) errors.lastName = 'Last name is required';
    if (!cinNumber) errors.cinNumber = 'CIN number is required';
    if (!phone) errors.phone = 'Phone number is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      // Create user in the database
      const newUser = {
        first_name: firstName,
        last_name: lastName,
        cin: cinNumber,
        address,
        phone,
        company_name: companyName,
        admin_uid: user?.id,
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select();
      
      if (error) throw error;
      
      // Assign to developer if selected
      if (selectedDeveloper && data && data[0]) {
        await assignUserToDeveloper(data[0].id, selectedDeveloper);
      }
      
      toast({
        title: "User created",
        description: "User has been created successfully",
        variant: "default"
      });
      
      // Reset form and refresh list
      resetForm();
      fetchUsers();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const assignUserToDeveloper = async (userId: string, developerId: string) => {
    try {
      // Get current assigned users for this developer
      const { data: developerData, error: getError } = await supabase
        .from('developers')
        .select('assigned_user_ids')
        .eq('id', developerId)
        .single();
      
      if (getError) throw getError;
      
      if (!developerData) {
        throw new Error('Developer not found');
      }
      
      // Add this user to the assigned_user_ids array
      const updatedUserIds = [...(developerData.assigned_user_ids || [])];
      
      // Only add if not already assigned
      if (!updatedUserIds.includes(userId)) {
        updatedUserIds.push(userId);
      }
      
      // Update the developer record
      const { error: updateError } = await supabase
        .from('developers')
        .update({ assigned_user_ids: updatedUserIds })
        .eq('id', developerId);
      
      if (updateError) throw updateError;
      
      toast({
        title: "User assigned",
        description: "User has been assigned to the developer",
        variant: "default"
      });
      fetchDevelopers();
    } catch (error: any) {
      console.error('Error assigning user to developer:', error.message);
      toast({
        title: "Error assigning user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // First, check if user is assigned to any developers and remove the assignment
      for (const developer of developers) {
        if (developer.assigned_user_ids.includes(selectedUser.id)) {
          const updatedUserIds = developer.assigned_user_ids.filter(id => id !== selectedUser.id);
          
          await supabase
            .from('developers')
            .update({ assigned_user_ids: updatedUserIds })
            .eq('id', developer.id);
        }
      }
      
      // Then delete the user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.id);
      
      if (error) throw error;
      
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
        variant: "default"
      });
      
      // Refresh user list
      fetchUsers();
      fetchDevelopers();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error deleting user:', error.message);
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUser || !selectedDeveloper) return;
    
    try {
      await assignUserToDeveloper(selectedUser.id, selectedDeveloper);
      setIsAssignDialogOpen(false);
      setSelectedDeveloper(null);
    } catch (error: any) {
      console.error('Error assigning user:', error.message);
      toast({
        title: "Error assigning user",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setCinNumber('');
    setAddress('');
    setPhone('');
    setCompanyName('');
    setSelectedDeveloper(null);
    setFormErrors({});
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.cin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.company_name && user.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Find which developer a user is assigned to
  const findUserDeveloper = (userId: string) => {
    for (const dev of developers) {
      if (dev.assigned_user_ids.includes(userId)) {
        return dev;
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#210F37]">User Management</h2>
          <p className="text-[#A55B4B]">Manage your users and their information</p>
        </div>
        <Button className="bg-[#4F1C51] hover:bg-[#210F37]" onClick={() => setIsDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>

      <div className="flex items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#A55B4B]" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-[#DCA06D]/30 focus:border-[#4F1C51]"
          />
        </div>
      </div>

      <Card className="border-[#DCA06D]/30 shadow-md">
        <CardHeader className="bg-[#210F37]/5">
          <CardTitle className="text-lg font-medium text-[#210F37]">Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-[#4F1C51] border-t-transparent rounded-full"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <UserX size={48} className="text-[#A55B4B]/40 mb-4" />
              <p className="text-lg font-medium text-[#210F37]">No users found</p>
              <p className="text-[#A55B4B] mt-1">
                {searchQuery ? "Try adjusting your search" : "Create your first user to get started"}
              </p>
              <Button 
                className="mt-4 bg-[#4F1C51] hover:bg-[#210F37]"
                onClick={() => setIsDialogOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#210F37]/5">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>CIN</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const assignedDeveloper = findUserDeveloper(user.id);
                    
                    return (
                      <TableRow key={user.id} className="hover:bg-[#DCA06D]/5">
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.cin}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.company_name || "-"}</TableCell>
                        <TableCell>
                          {assignedDeveloper ? (
                            <Badge className="bg-[#4F1C51]/20 text-[#4F1C51] border-[#4F1C51]/30 hover:bg-[#4F1C51]/30">
                              <UserCog className="mr-1 h-3 w-3" />
                              {assignedDeveloper.first_name} {assignedDeveloper.last_name}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[#A55B4B] border-[#A55B4B]/30">
                              <CircleSlash className="mr-1 h-3 w-3" />
                              Not Assigned
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-[#DCA06D]/30">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsAssignDialogOpen(true);
                                }}
                              >
                                <UserCog className="mr-2 h-4 w-4" />
                                Assign to Developer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white border-[#DCA06D]/30">
          <DialogHeader>
            <DialogTitle className="text-[#210F37]">Create a New User</DialogTitle>
            <DialogDescription>
              Fill in the user details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateUser}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`border-[#DCA06D]/30 focus:border-[#4F1C51] ${formErrors.firstName ? 'border-red-500' : ''}`}
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-xs">{formErrors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`border-[#DCA06D]/30 focus:border-[#4F1C51] ${formErrors.lastName ? 'border-red-500' : ''}`}
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-xs">{formErrors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cinNumber">CIN Number *</Label>
                  <Input
                    id="cinNumber"
                    value={cinNumber}
                    onChange={(e) => setCinNumber(e.target.value)}
                    className={`border-[#DCA06D]/30 focus:border-[#4F1C51] ${formErrors.cinNumber ? 'border-red-500' : ''}`}
                  />
                  {formErrors.cinNumber && (
                    <p className="text-red-500 text-xs">{formErrors.cinNumber}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`border-[#DCA06D]/30 focus:border-[#4F1C51] ${formErrors.phone ? 'border-red-500' : ''}`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs">{formErrors.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="border-[#DCA06D]/30 focus:border-[#4F1C51]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="border-[#DCA06D]/30 focus:border-[#4F1C51]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="developerAssignment">Assign to Developer (Optional)</Label>
                <Select value={selectedDeveloper || undefined} onValueChange={setSelectedDeveloper}>
                  <SelectTrigger className="border-[#DCA06D]/30 focus:border-[#4F1C51]">
                    <SelectValue placeholder="Select a developer" />
                  </SelectTrigger>
                  <SelectContent>
                    {developers.map((dev) => (
                      <SelectItem key={dev.id} value={dev.id}>
                        {dev.first_name} {dev.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
                className="border-[#A55B4B]/30 text-[#A55B4B] hover:bg-[#A55B4B]/10"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#4F1C51] hover:bg-[#210F37]">
                Save User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Assign User Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border-[#DCA06D]/30">
          <DialogHeader>
            <DialogTitle className="text-[#210F37]">Assign User to Developer</DialogTitle>
            <DialogDescription>
              Select a developer to assign {selectedUser?.first_name} {selectedUser?.last_name} to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label>Developer</Label>
              <Select value={selectedDeveloper || undefined} onValueChange={setSelectedDeveloper}>
                <SelectTrigger className="border-[#DCA06D]/30 focus:border-[#4F1C51]">
                  <SelectValue placeholder="Select a developer" />
                </SelectTrigger>
                <SelectContent>
                  {developers.map((dev) => (
                    <SelectItem key={dev.id} value={dev.id}>
                      {dev.first_name} {dev.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedDeveloper(null);
                setIsAssignDialogOpen(false);
              }}
              className="border-[#A55B4B]/30 text-[#A55B4B] hover:bg-[#A55B4B]/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssignUser} 
              className="bg-[#4F1C51] hover:bg-[#210F37]"
              disabled={!selectedDeveloper}
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border-[#DCA06D]/30">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.first_name} {selectedUser?.last_name}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-[#A55B4B]/30 text-[#A55B4B] hover:bg-[#A55B4B]/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteUser}
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
