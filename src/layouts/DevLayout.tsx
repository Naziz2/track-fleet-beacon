
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Bell, LogOut, Home, User, Truck, Users, CreditCard, LayoutDashboard, BellRing } from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const DevLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Toggle collapsed state based on mobile detection
  useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#F6F6F7]">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar 
          className="h-screen border-r border-[#DCA06D]/30 bg-[#210F37] text-white"
        >
          <div className="p-4">
            <h1 className="text-2xl font-serif font-bold tracking-wide text-[#DCA06D]">
              <span className="text-3xl">A</span>utotrace
            </h1>
            <p className="text-xs text-[#A55B4B]/80">Developer Dashboard</p>
          </div>

          <div className="space-y-1 px-2">
            <Sidebar.NavItem 
              href="/developer/dashboard" 
              icon={<LayoutDashboard size={20} />}
              label="Dashboard" 
            />
            <Sidebar.NavItem 
              href="/developer/users" 
              icon={<Users size={20} />}
              label="Users" 
            />
            <Sidebar.NavItem 
              href="/developer/vehicles" 
              icon={<Truck size={20} />}
              label="Vehicles" 
            />
            <Sidebar.NavItem 
              href="/developer/alerts" 
              icon={<BellRing size={20} />}
              label="Alerts" 
            />
            <Sidebar.NavItem 
              href="/developer/plan" 
              icon={<CreditCard size={20} />}
              label="Plan" 
            />
            <Sidebar.NavItem 
              href="/developer/payment" 
              icon={<CreditCard size={20} />}
              label="Payments" 
            />
            <Sidebar.NavItem 
              href="/developer/profile" 
              icon={<User size={20} />}
              label="Profile" 
            />
          </div>
          
          <div className="mt-auto p-2">
            <Button 
              onClick={handleSignOut} 
              className="w-full justify-start bg-[#A55B4B]/10 text-[#A55B4B] hover:bg-[#A55B4B]/20"
              variant="ghost"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </Sidebar>
      )}

      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-50"
          onClick={() => setShowMobileMenu(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#210F37]">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <span className="sr-only">Toggle Menu</span>
        </Button>
      )}

      {/* Mobile Menu Dialog */}
      <Dialog open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <DialogContent className="sm:max-w-[300px] p-0 bg-[#210F37] text-white">
          <div className="p-4">
            <h1 className="text-2xl font-serif font-bold tracking-wide text-[#DCA06D]">
              <span className="text-3xl">A</span>utotrace
            </h1>
            <p className="text-xs text-[#A55B4B]/80">Developer Dashboard</p>
          </div>
          
          <nav className="space-y-2 p-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/developer/dashboard");
                setShowMobileMenu(false);
              }}
            >
              <LayoutDashboard className="mr-2 h-5 w-5" />
              <span>Dashboard</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/developer/users");
                setShowMobileMenu(false);
              }}
            >
              <Users className="mr-2 h-5 w-5" />
              <span>Users</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/developer/vehicles");
                setShowMobileMenu(false);
              }}
            >
              <Truck className="mr-2 h-5 w-5" />
              <span>Vehicles</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/developer/alerts");
                setShowMobileMenu(false);
              }}
            >
              <BellRing className="mr-2 h-5 w-5" />
              <span>Alerts</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/developer/plan");
                setShowMobileMenu(false);
              }}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              <span>Plan</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/developer/payment");
                setShowMobileMenu(false);
              }}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              <span>Payments</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => {
                navigate("/developer/profile");
                setShowMobileMenu(false);
              }}
            >
              <User className="mr-2 h-5 w-5" />
              <span>Profile</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start bg-[#A55B4B]/10 text-[#A55B4B] hover:bg-[#A55B4B]/20"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-5 w-5" />
              <span>Logout</span>
            </Button>
          </nav>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DevLayout;
