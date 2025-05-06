
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Car, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DeveloperUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<Customer[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
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
          const { assigned_user_ids } = developerData;
          
          // Fetch assigned users
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .in('id', assigned_user_ids);
            
          if (userError) throw userError;
          
          setUsers(userData || []);
          setFilteredUsers(userData || []);
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
        const updatedUser = payload.new as Customer;
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
        <h1 className="text-2xl font-bold tracking-tight">Your Assigned Users</h1>
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
            <div className="py-12 flex flex-col items-center">
              <User className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Users Assigned</h3>
              <p className="text-muted-foreground max-w-md">
                You don't have any users assigned to you yet. Please contact your administrator to assign users to you.
              </p>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeveloperUsers;
