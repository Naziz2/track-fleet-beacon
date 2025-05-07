
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Developer } from "@/types";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const AdminDevelopers = () => {
  const { user } = useAuth();
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<Developer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState<Developer | null>(null);
  
  // Form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cin, setCin] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  
  // Fetch developers
  useEffect(() => {
    const fetchDevelopers = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch developers managed by this admin
        const { data: developerData, error: developerError } = await supabase
          .from('developers')
          .select('*')
          .eq('admin_uid', user.id);
          
        if (developerError) throw developerError;
        
        setDevelopers(developerData || []);
        setFilteredDevelopers(developerData || []);
      } catch (error) {
        console.error("Error fetching developers:", error);
        toast.error("Failed to load developers");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDevelopers();
    
    // Set up subscription for real-time updates
    const developersSubscription = supabase
      .channel('developers_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'developers' }, (payload) => {
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const developer = payload.new as Developer;
          if (developer.admin_uid === user?.id) {
            fetchDevelopers();
          }
        } else if (payload.eventType === 'DELETE') {
          const deletedDeveloper = payload.old as Developer;
          setDevelopers(prev => prev.filter(d => d.id !== deletedDeveloper.id));
          setFilteredDevelopers(prev => prev.filter(d => d.id !== deletedDeveloper.id));
        }
      })
      .subscribe();
      
    // Cleanup subscription
    return () => {
      developersSubscription.unsubscribe();
    };
  }, [user]);
  
  // Handle search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDevelopers(developers);
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      setFilteredDevelopers(
        developers.filter((developer) => 
          developer.first_name.toLowerCase().includes(lowerCaseSearch) ||
          developer.last_name.toLowerCase().includes(lowerCaseSearch) ||
          developer.email?.toLowerCase().includes(lowerCaseSearch) ||
          developer.company_name.toLowerCase().includes(lowerCaseSearch)
        )
      );
    }
  }, [searchTerm, developers]);
  
  // Set form values when editing
  useEffect(() => {
    if (isEditing && selectedDeveloper) {
      setEmail(selectedDeveloper.email || '');
      setFirstName(selectedDeveloper.first_name);
      setLastName(selectedDeveloper.last_name);
      setCin(selectedDeveloper.cin);
      setPhone(selectedDeveloper.phone);
      setCompanyName(selectedDeveloper.company_name);
      setAddress(selectedDeveloper.address);
    } else {
      resetForm();
    }
  }, [isEditing, selectedDeveloper]);
  
  // Reset the form
  const resetForm = () => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setCin("");
    setPhone("");
    setCompanyName("");
    setAddress("");
  };
  
  // Dialog open/close handlers
  const handleOpenDialog = (developer?: Developer) => {
    if (developer) {
      setSelectedDeveloper(developer);
      setIsEditing(true);
    } else {
      setSelectedDeveloper(null);
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
      if (isEditing && selectedDeveloper) {
        // Update existing developer
        const { error } = await supabase
          .from('developers')
          .update({
            first_name: firstName,
            last_name: lastName,
            cin: cin,
            phone: phone,
            company_name: companyName,
            address: address,
          })
          .eq('id', selectedDeveloper.id);
          
        if (error) throw error;
        
        toast.success("Developer updated successfully");
      } else {
        // Create user in auth and then create developer record
        const tempPassword = Math.random().toString(36).slice(-8);
        
        // First create the user in auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          password: tempPassword,
          email_confirm: true
        });
        
        if (authError) throw authError;
        
        if (authData?.user) {
          // Then create the developer record
          const { error: devError } = await supabase
            .from('developers')
            .insert({
              id: authData.user.id,
              email: email,
              first_name: firstName,
              last_name: lastName,
              cin: cin,
              phone: phone,
              company_name: companyName,
              address: address,
              admin_uid: user.id,
              assigned_vehicle_ids: [],
              assigned_user_ids: []
            });
            
          if (devError) {
            // If developer creation fails, we should delete the auth user
            await supabase.auth.admin.deleteUser(authData.user.id);
            throw devError;
          }
          
          toast.success("Developer created successfully", {
            description: `Temporary password: ${tempPassword}`
          });
        }
      }
      
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving developer:", error);
      toast.error("Failed to save developer", {
        description: error.message
      });
    }
  };
  
  // Handle delete
  const handleDelete = async (developerId: string) => {
    if (!confirm("Are you sure you want to delete this developer?")) {
      return;
    }
    
    try {
      // Delete the developer
      const { error } = await supabase
        .from('developers')
        .delete()
        .eq('id', developerId);
        
      if (error) throw error;
      
      toast.success("Developer deleted successfully");
    } catch (error) {
      console.error("Error deleting developer:", error);
      toast.error("Failed to delete developer");
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading developers...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Developer Management</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search developers..."
                className="w-full sm:w-[250px] pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Developer
            </Button>
          </div>
        </div>

        {developers.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground py-8">No developers found. Add your first developer to get started.</p>
              <Button onClick={() => handleOpenDialog()} className="mt-2">
                <Plus className="h-4 w-4 mr-2" />
                Add Developer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Developers</CardTitle>
              <CardDescription>
                Manage your development team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Assigned Vehicles</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevelopers.map((developer) => (
                    <TableRow key={developer.id}>
                      <TableCell className="font-medium">
                        {developer.first_name} {developer.last_name}
                      </TableCell>
                      <TableCell>{developer.email}</TableCell>
                      <TableCell>{developer.phone}</TableCell>
                      <TableCell>{developer.company_name}</TableCell>
                      <TableCell>
                        {developer.assigned_vehicle_ids?.length || 0}
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
                            <DropdownMenuItem onClick={() => handleOpenDialog(developer)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(developer.id)}
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

      {/* Developer Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Developer' : 'Add New Developer'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the developer details below."
                : "Fill in the details for the new developer. This will send them an invitation email."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isEditing}
                  className="col-span-3"
                  required
                />
              </div>
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
            </div>
            <DialogFooter>
              <Button type="submit">{isEditing ? 'Update Developer' : 'Add Developer'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminDevelopers;
