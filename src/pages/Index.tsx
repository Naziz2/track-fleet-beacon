
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  
  // Redirect logged-in users
  useEffect(() => {
    if (userRole === "admin") {
      navigate("/admin/dashboard");
    } else if (userRole === "developer") {
      navigate("/developer/dashboard");
    }
  }, [userRole, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-[#DCA06D] tracking-wider">
            <span className="text-6xl md:text-8xl">A</span>utotrace
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Advanced vehicle tracking and fleet management system
          </p>
        </header>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl border border-white/10">
              <h2 className="text-3xl font-bold text-[#DCA06D] mb-6">Fleet Management Simplified</h2>
              <p className="text-white/80 mb-6">
                Autotrace delivers powerful real-time tracking and analytics for your entire fleet, 
                helping you optimize routes, reduce fuel consumption, and improve safety.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-[#DCA06D] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Real-time GPS tracking with accurate location data
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-[#DCA06D] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Comprehensive alert system based on vehicle telemetrics
                </li>
                <li className="flex items-center text-white/80">
                  <svg className="w-5 h-5 text-[#DCA06D] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced analytics and reporting dashboard
                </li>
              </ul>
            </div>

            <div>
              <Button asChild className="bg-[#4F1C51] hover:bg-[#210F37] transition-colors duration-300 px-8 py-3 rounded-md text-white text-lg">
                <Link to="/login">Login to Dashboard</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#DCA06D]/20 to-transparent rounded-2xl transform -rotate-3"></div>
            <div className="bg-[#210F37]/40 backdrop-blur-sm border border-white/10 p-8 rounded-xl relative z-10">
              <h3 className="text-2xl font-bold text-[#DCA06D] mb-4">Why Choose Autotrace?</h3>
              <p className="text-white/80 mb-6">
                With Autotrace, you get a comprehensive solution that combines cutting-edge 
                technology with ease of use, delivering real value to your fleet management operations.
              </p>
              
              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-medium text-[#DCA06D]">Powerful Analytics</h4>
                  <p className="text-sm text-white/60">
                    Transform raw data into actionable insights with our advanced reporting tools
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="font-medium text-[#DCA06D]">Enterprise Security</h4>
                  <p className="text-sm text-white/60">
                    Bank-level data protection ensures your fleet information stays secure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="mt-20 text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} Autotrace. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
