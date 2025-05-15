
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarItem } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, Car, Users, PersonStanding, Settings, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toastUtils";
import { useMobile } from "@/hooks/use-mobile";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMobile();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const initials = user?.email
    ? `${user.email.substring(0, 1).toUpperCase()}${user.email.substring(1, 2)}`
    : "U";

  return (
    <div className="flex h-screen bg-[#F8F8FB] overflow-hidden">
      <Sidebar 
        collapsed={collapsed || isMobile} 
        className="border-r border-[#DCA06D]/20 bg-white"
      >
        <SidebarHeader className="py-6">
          <div className="flex items-center justify-between px-4">
            {!collapsed && (
              <Link to="/admin/dashboard" className="text-2xl font-bold text-[#210F37]">
                <span className="text-[#4F1C51] font-serif tracking-wider">
                  <span className="text-3xl">A</span>utotrace
                </span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-gray-500"
            >
              {collapsed ? <PanelLeftOpen size="20" /> : <PanelLeftClose size="20" />}
            </Button>
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarItem
            icon={<Home size="20" />}
            label="Dashboard"
            to="/admin/dashboard"
            active={location.pathname === "/admin/dashboard"}
          />
          <SidebarItem
            icon={<Car size="20" />}
            label="Vehicles"
            to="/admin/vehicles"
            active={location.pathname === "/admin/vehicles"}
          />
          <SidebarItem
            icon={<PersonStanding size="20" />}
            label="Developers"
            to="/admin/developers"
            active={location.pathname === "/admin/developers"}
          />
          <SidebarItem
            icon={<Users size="20" />}
            label="Users"
            to="/admin/users"
            active={location.pathname === "/admin/users"}
          />
          <SidebarItem
            icon={<Settings size="20" />}
            label="Profile"
            to="/admin/profile"
            active={location.pathname === "/admin/profile"}
          />
        </SidebarContent>
        
        <SidebarFooter className="px-3 py-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[#4F1C51] text-white">{initials}</AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="ml-3">
                    <p className="text-sm font-medium text-[#210F37]">{user?.email}</p>
                    <p className="text-xs text-[#A55B4B]">Admin</p>
                  </div>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/admin/profile" className="cursor-pointer">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8F8FB]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
