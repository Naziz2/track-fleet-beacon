
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserX, Search, MoreVertical, UsersRound } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  cin: string;
  address: string;
  phone: string;
  company_name: string;
  vehicle_id: string | null;
}

interface Vehicle {
  id: string;
  plate_number: string;
  model?: string;
  type?: string;
  status: string;
}

const DeveloperUsers = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [assignedVehicles, setAssignedVehicles] = useState<Record<string, Vehicle>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchAssignedUsers();
    }
  }, [user]);

  const fetchAssignedUsers = async () => {
    try {
      setLoading(true);
      
      // First get the developer record to get assigned user IDs
      const { data: developerData, error: developerError } = await supabase
        .from('developers')
        .select('assigned_user_ids')
        .eq('id', user?.id)
        .single();
      
      if (developerError) throw developerError;
      
      if (!developerData?.assigned_user_ids?.length) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // Now fetch the actual user records
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .in('id', developerData.assigned_user_ids);
      
      if (userError) throw userError;
      
      setUsers(userData || []);
      
      // Fetch vehicles info for users that have assigned vehicles
      const userVehicleIds = userData
        ?.filter(u => u.vehicle_id)
        .map(u => u.vehicle_id)
        .filter((id): id is string => id !== null);
      
      if (userVehicleIds && userVehicleIds.length > 0) {
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .in('id', userVehicleIds);
        
        if (vehiclesError) throw vehiclesError;
        
        const vehicleMap: Record<string, Vehicle> = {};
        if (vehiclesData) {
          vehiclesData.forEach(v => {
            vehicleMap[v.id] = v;
          });
        }
        
        setAssignedVehicles(vehicleMap);
      }
    } catch (error: any) {
      console.error('Error fetching assigned users:', error.message);
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.cin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.company_name && user.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#210F37]">Users</h2>
        <p className="text-[#A55B4B]">Manage your assigned users</p>
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
          <CardTitle className="text-lg font-medium text-[#210F37]">Assigned Users</CardTitle>
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
              <UsersRound size={48} className="text-[#A55B4B]/40 mb-4" />
              <p className="text-lg font-medium text-[#210F37]">No users assigned</p>
              <p className="text-[#A55B4B] mt-1">
                {searchQuery ? "Try adjusting your search" : "You don't have any users assigned to you yet"}
              </p>
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
                    <TableHead>Vehicle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const vehicle = user.vehicle_id ? assignedVehicles[user.vehicle_id] : null;
                    return (
                      <TableRow key={user.id} className="hover:bg-[#DCA06D]/5">
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell>{user.cin}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>{user.company_name || "-"}</TableCell>
                        <TableCell>
                          {vehicle ? (
                            <Badge className="bg-[#4F1C51]/20 text-[#4F1C51]">
                              {vehicle.plate_number}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[#A55B4B]">
                              No Vehicle
                            </Badge>
                          )}
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
    </div>
  );
};

export default DeveloperUsers;
