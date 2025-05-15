
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
    <div className="min-h-screen bg-[#210F37]">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-[#DCA06D] tracking-wider">
            <span className="text-6xl md:text-8xl">A</span>utotrace
          </h1>
          <p className="text-xl text-[#A55B4B] max-w-2xl mx-auto">
            Advanced vehicle tracking and fleet management system
          </p>
        </header>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-[#DCA06D] mb-6">Fleet Management Simplified</h2>
              <ul className="space-y-4 text-[#A55B4B]">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#4F1C51] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Real-time vehicle tracking with accurate GPS data
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#4F1C51] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Comprehensive alert system based on vehicle telemetrics
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#4F1C51] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  User and developer management for full team collaboration
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-[#4F1C51] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Detailed analytics and reporting tools
                </li>
              </ul>
              <div className="mt-8">
                <Button asChild className="bg-[#4F1C51] hover:bg-[#210F37] transition-colors duration-300 px-8 py-3 rounded-md text-white text-lg">
                  <Link to="/login">Login to Dashboard</Link>
                </Button>
                
                {/* Registration link hidden to normal users - only accessible via direct URL with access code */}
              </div>
            </div>
            
            <div className="bg-[#4F1C51]/20 rounded-lg p-8 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#DCA06D]/10 rounded-full -mt-20 -mr-20"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#A55B4B]/10 rounded-full -mb-20 -ml-20"></div>
              <h3 className="text-2xl font-bold text-[#DCA06D] mb-4 relative z-10">Why Choose Autotrace?</h3>
              <p className="text-[#A55B4B] mb-6 relative z-10">
                Autotrace provides comprehensive fleet management with real-time 
                tracking, sophisticated alert systems, and powerful analytics to keep 
                your vehicles running efficiently and safely.
              </p>
              <div className="bg-[#210F37]/50 p-4 rounded-md shadow-inner relative z-10">
                <h4 className="text-[#DCA06D] font-bold mb-2">Our Technology</h4>
                <p className="text-sm text-[#A55B4B]/90">
                  Built on cutting-edge web technology and secure data infrastructure,
                  Autotrace delivers reliable, scalable fleet management solutions for 
                  businesses of all sizes.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="mt-20 text-center text-[#A55B4B]/60 text-sm">
          <p>&copy; {new Date().getFullYear()} Autotrace. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
