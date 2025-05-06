
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const { userRole, isLoading } = useAuth();
  const navigate = useNavigate();

  // Auto redirect if user is already authenticated
  useEffect(() => {
    if (!isLoading) {
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'developer') {
        navigate('/developer/dashboard');
      }
    }
  }, [userRole, isLoading, navigate]);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <header className="bg-fleet-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">FleetBeacon</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl">
            Real-time vehicle tracking and fleet management solution for businesses of all sizes
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="bg-white text-fleet-700 hover:bg-gray-100"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-fleet-700"
              size="lg"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-fleet-100 text-fleet-700 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Real-time Tracking</h3>
              <p className="text-gray-600">
                Monitor your entire fleet in real-time with accurate GPS tracking and instant updates.
              </p>
            </Card>

            <Card className="p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-fleet-100 text-fleet-700 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Advanced Management</h3>
              <p className="text-gray-600">
                Efficiently manage your vehicles, drivers, and routes from a centralized dashboard.
              </p>
            </Card>

            <Card className="p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-fleet-100 text-fleet-700 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Alerts</h3>
              <p className="text-gray-600">
                Receive instant notifications for speeding, geofence violations, and maintenance needs.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-fleet-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to optimize your fleet management?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of businesses that trust FleetBeacon for their vehicle tracking needs.
          </p>
          <Button
            className="bg-fleet-600 hover:bg-fleet-700 text-white"
            size="lg"
            onClick={() => navigate('/register')}
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-fleet-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">FleetBeacon</h3>
              <p className="text-fleet-200">
                The ultimate solution for vehicle tracking and fleet management.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-fleet-200 hover:text-white transition-colors">Features</a>
                </li>
                <li>
                  <a href="#" className="text-fleet-200 hover:text-white transition-colors">Pricing</a>
                </li>
                <li>
                  <a href="#" className="text-fleet-200 hover:text-white transition-colors">About Us</a>
                </li>
                <li>
                  <a href="#" className="text-fleet-200 hover:text-white transition-colors">Contact</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <address className="not-italic text-fleet-200">
                <p>123 Tracking Avenue</p>
                <p>Fleet City, FC 12345</p>
                <p className="mt-2">info@fleetbeacon.com</p>
                <p>(555) 123-4567</p>
              </address>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-fleet-700 text-center text-fleet-300">
            <p>&copy; {new Date().getFullYear()} FleetBeacon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
