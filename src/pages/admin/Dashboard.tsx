
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle, Developer, Customer } from "@/types";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [vehicleCount, setVehicleCount] = useState<number>(0);
  const [developerCount, setDeveloperCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [activeVehicles, setActiveVehicles] = useState<number>(0);
  const [recentVehicles, setRecentVehicles] = useState<Vehicle[]>([]);
  const [activityData, setActivityData] = useState<{name: string, vehicles: number}[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch counts
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*');
        
        const { data: developers, error: developersError } = await supabase
          .from('developers')
          .select('*');
        
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*');
        
        if (vehiclesError) throw vehiclesError;
        if (developersError) throw developersError;
        if (usersError) throw usersError;
        
        // Set counts
        setVehicleCount(vehicles?.length || 0);
        setDeveloperCount(developers?.length || 0);
        setUserCount(users?.length || 0);
        
        // Active vehicles
        const active = vehicles?.filter(v => v.status === 'active').length || 0;
        setActiveVehicles(active);
        
        // Recent vehicles
        const recent = vehicles?.slice(0, 5) || [];
        setRecentVehicles(recent as Vehicle[]);
        
        // Mock activity data (in a real app, this would come from the database)
        const mockActivity = [
          { name: 'Mon', vehicles: 4 },
          { name: 'Tue', vehicles: 6 },
          { name: 'Wed', vehicles: 8 },
          { name: 'Thu', vehicles: 7 },
          { name: 'Fri', vehicles: 9 },
          { name: 'Sat', vehicles: 5 },
          { name: 'Sun', vehicles: 3 },
        ];
        setActivityData(mockActivity);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back to your dashboard
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicleCount}</div>
            <p className="text-xs text-muted-foreground">
              {activeVehicles} currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Developers</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{developerCount}</div>
            <p className="text-xs text-muted-foreground">
              Monitoring your fleet
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              Vehicle owners and operators
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last hour
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and tables */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Vehicle Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  stroke="#888888"
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="vehicles"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Vehicles</CardTitle>
              <p className="text-xs text-muted-foreground">
                {recentVehicles.length} vehicles recently added or updated
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto"
              onClick={() => navigate('/admin/vehicles')}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVehicles.length > 0 ? (
                recentVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="flex items-center justify-between border-b border-muted pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {vehicle.plate_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.status}
                      </p>
                    </div>
                    <div className={`text-sm ${
                      vehicle.status === 'active' ? 'text-green-500' : 
                      vehicle.status === 'maintenance' ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {vehicle.status === 'active' ? '● Active' : 
                       vehicle.status === 'maintenance' ? '● Maintenance' : '● Inactive'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No vehicles found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
