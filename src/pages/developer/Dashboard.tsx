
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, LineChart } from "@/components/ui/recharts";
import { Button } from "@/components/ui/button";
import { BellRing, Car, Users, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const DeveloperDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    vehicleCount: 0,
    userCount: 0,
    alertCount: 0,
    activeVehicles: 0
  });
  
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // First get the developer record
        const { data: developerData, error: developerError } = await supabase
          .from('developers')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (developerError) throw developerError;
        
        if (developerData) {
          const { assigned_vehicle_ids = [], assigned_user_ids = [] } = developerData;
          
          // Count vehicles and active vehicles
          if (assigned_vehicle_ids.length > 0) {
            const { data: vehicleData, error: vehicleError } = await supabase
              .from('vehicles')
              .select('*')
              .in('id', assigned_vehicle_ids);
              
            if (vehicleError) throw vehicleError;
            
            if (vehicleData) {
              setStats(prev => ({
                ...prev,
                vehicleCount: vehicleData.length,
                activeVehicles: vehicleData.filter(v => v.status === 'active').length
              }));
            }
          }
          
          // Count assigned users
          setStats(prev => ({
            ...prev,
            userCount: assigned_user_ids.length
          }));
          
          // Get alerts count
          const { count: alertCount, error: alertError } = await supabase
            .from('alerts')
            .select('*', { count: 'exact', head: true })
            .in('vehicle_id', assigned_vehicle_ids);
            
          if (alertError) throw alertError;
          
          if (alertCount !== null) {
            setStats(prev => ({
              ...prev,
              alertCount
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Developer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
                <p className="text-3xl font-bold">{stats.vehicleCount}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Car className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <span className={stats.activeVehicles === stats.vehicleCount ? "text-green-600" : ""}>
                {stats.activeVehicles} active
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{stats.userCount}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              All assigned users
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-3xl font-bold">{stats.alertCount}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <BellRing className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 text-sm">
              {stats.alertCount > 0 ? (
                <span className="text-yellow-600">Requires attention</span>
              ) : (
                <span className="text-green-600">All clear</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {stats.alertCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Active Alerts</AlertTitle>
          <AlertDescription>
            There are {stats.alertCount} active alerts that require your attention.
            <div className="mt-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/developer/alerts">View Alerts</a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Activity</CardTitle>
            <CardDescription>Activity over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <LineChart 
                data={[
                  { name: "Mon", value: 12 },
                  { name: "Tue", value: 18 },
                  { name: "Wed", value: 15 },
                  { name: "Thu", value: 22 },
                  { name: "Fri", value: 27 },
                  { name: "Sat", value: 14 },
                  { name: "Sun", value: 9 },
                ]}
                categories={["value"]}
                index="name"
                valueFormatter={(value) => `${value} trips`}
                colors={["blue"]}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Users by vehicle assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <BarChart
                data={[
                  { name: "With Vehicle", value: Math.floor(stats.userCount * 0.7) },
                  { name: "No Vehicle", value: stats.userCount - Math.floor(stats.userCount * 0.7) },
                ]}
                categories={["value"]}
                index="name"
                valueFormatter={(value) => `${value} users`}
                colors={["blue"]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
