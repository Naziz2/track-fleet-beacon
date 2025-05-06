
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLayout from "./layouts/AdminLayout";
import DevLayout from "./layouts/DevLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminVehicles from "./pages/admin/Vehicles";
import AdminDevelopers from "./pages/admin/Developers";
import AdminUsers from "./pages/admin/Users";
import AdminProfile from "./pages/admin/Profile";
import DeveloperDashboard from "./pages/developer/Dashboard";
import DeveloperVehicles from "./pages/developer/Vehicles";
import DeveloperUsers from "./pages/developer/Users";
import DeveloperAlerts from "./pages/developer/Alerts";
import DeveloperProfile from "./pages/developer/Profile";

// Protected route wrapper
const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectPath = "/login" 
}: { 
  children: React.ReactNode; 
  allowedRoles: string[]; 
  redirectPath?: string;
}) => {
  const { userRole, isLoading } = useAuth();
  
  if (isLoading) {
    // You could render a loading spinner here
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { userRole } = useAuth();
  
  // Redirect based on role
  useEffect(() => {
    // When user is authenticated, redirect to their appropriate dashboard
    if (userRole === 'admin') {
      if (window.location.pathname === '/') {
        window.location.href = '/admin/dashboard';
      }
    } else if (userRole === 'developer') {
      if (window.location.pathname === '/') {
        window.location.href = '/developer/dashboard';
      }
    }
  }, [userRole]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="vehicles" element={<AdminVehicles />} />
        <Route path="developers" element={<AdminDevelopers />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>
      
      {/* Developer Routes */}
      <Route path="/developer" element={
        <ProtectedRoute allowedRoles={['developer']}>
          <DevLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DeveloperDashboard />} />
        <Route path="vehicles" element={<DeveloperVehicles />} />
        <Route path="users" element={<DeveloperUsers />} />
        <Route path="alerts" element={<DeveloperAlerts />} />
        <Route path="profile" element={<DeveloperProfile />} />
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
