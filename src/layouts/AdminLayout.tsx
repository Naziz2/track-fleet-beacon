import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/router';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

// Import the AlertProcessor
import AlertProcessor from "@/components/AlertProcessor";

const AdminLayout = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          // Check if the user exists in the admins table
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!adminError && adminData) {
            setUserRole('admin');
            setLoading(false);
            return;
          }

          // If not an admin, check if the user exists in the developers table
          const { data: developerData, error: developerError } = await supabase
            .from('developers')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!developerError && developerData) {
            setUserRole('developer');
            setLoading(false);
            return;
          }

          // If not an admin or developer, the user role is unassigned
          setUserRole('unassigned');
          setLoading(false);
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('unassigned'); // Assign a default role in case of error
          setLoading(false);
        }
      } else {
        setUserRole(null); // No user, no role
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

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
    <div className="h-full flex">
      <AlertProcessor />
      <div className="w-64 flex-none bg-gray-100 border-r border-gray-200 py-4 px-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-600">Manage your fleet and users.</p>
        </div>
        <nav>
          <ul>
            <li className="mb-2">
              <a href="/admin/Dashboardadmin" className="block py-2 px-4 rounded hover:bg-gray-200 transition-colors">
                Overview
              </a>
            </li>
            <li className="mb-2">
              <a href="/admin/Vehicles" className="block py-2 px-4 rounded hover:bg-gray-200 transition-colors">
                Vehicles
              </a>
            </li>
            <li className="mb-2">
              <a href="/admin/Users" className="block py-2 px-4 rounded hover:bg-gray-200 transition-colors">
                Users
              </a>
            </li>
            <li className="mb-2">
              <a href="/admin/Developers" className="block py-2 px-4 rounded hover:bg-gray-200 transition-colors">
                Developers
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome!</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full h-10 w-10 relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatars.dicebear.com/api/initials/${user?.email.charAt(0)}.svg`} alt={user?.email || "Avatar"} />
                  <AvatarFallback>{user?.email.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="container mx-auto">
          {/* Main content will be rendered here */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
