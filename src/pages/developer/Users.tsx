
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { User, mapUser } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DeveloperUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
          const { assigned_user_ids } = developerData;
          
          // Fetch assigned users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .in('id', assigned_user_ids);
            
          if (userError) throw userError;
          
          // Map raw data to User type
          const mappedUsers = (userData || []).map(mapUser);
          setUsers(mappedUsers);
          setFilteredUsers(mappedUsers);
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
  }, [user]);
  
  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      setFilteredUsers(
        users.filter((user) => 
          user.first_name.toLowerCase().includes(lowerCaseSearch) ||
          user.last_name.toLowerCase().includes(lowerCaseSearch) ||
          user.cin.toLowerCase().includes(lowerCaseSearch) ||
          user.phone.toLowerCase().includes(lowerCaseSearch) ||
          user.company_name.toLowerCase().includes(lowerCaseSearch)
        )
      );
    }
  }, [searchTerm, users]);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search users..."
            className="w-full sm:w-[250px] pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground py-8">No users are currently assigned to you.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Assigned Users</CardTitle>
            <CardDescription>
              Users that have been assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>CIN</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.company_name || "N/A"}</TableCell>
                    <TableCell>{user.cin}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(user)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* User details dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">First Name</div>
                <div>{selectedUser.first_name}</div>
                
                <div className="text-sm font-medium">Last Name</div>
                <div>{selectedUser.last_name}</div>
                
                <div className="text-sm font-medium">CIN</div>
                <div>{selectedUser.cin}</div>
                
                <div className="text-sm font-medium">Phone</div>
                <div>{selectedUser.phone}</div>
                
                <div className="text-sm font-medium">Company</div>
                <div>{selectedUser.company_name}</div>
                
                <div className="text-sm font-medium">Address</div>
                <div>{selectedUser.address}</div>
                
                <div className="text-sm font-medium">Vehicle ID</div>
                <div>{selectedUser.vehicle_id || "No vehicle assigned"}</div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setIsDetailsOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeveloperUsers;
