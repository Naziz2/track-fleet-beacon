
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  Shield, 
  Activity, 
  Zap, 
  ChevronRight, 
  Clock, 
  BarChart, 
  Send
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-fleet-700 to-fleet-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="mb-6 flex items-center justify-center space-x-2">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6 text-fleet-700" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">autotrace</h1>
          </div>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl leading-relaxed opacity-90">
            Intelligent vehicle tracking and fleet management with real-time analytics
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <Button
              className="bg-white text-fleet-700 hover:bg-gray-100 hover:shadow-md transition-all duration-200"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Sign In
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-fleet-700 transition-all duration-200"
              size="lg"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Fleet Management Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Streamline operations, reduce costs, and improve safety with our comprehensive vehicle tracking solution
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <Card className="p-8 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <div className="w-16 h-16 bg-fleet-50 text-fleet-700 rounded-full flex items-center justify-center mb-6">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Real-time Tracking</h3>
              <p className="text-gray-600">
                Monitor your entire fleet in real-time with accurate GPS tracking, custom geofences, and instant alerts.
              </p>
            </Card>

            <Card className="p-8 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <div className="w-16 h-16 bg-fleet-50 text-fleet-700 rounded-full flex items-center justify-center mb-6">
                <BarChart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Advanced Analytics</h3>
              <p className="text-gray-600">
                Gain valuable insights with detailed reports on usage patterns, maintenance needs, and driver behavior.
              </p>
            </Card>

            <Card className="p-8 flex flex-col items-center text-center hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <div className="w-16 h-16 bg-fleet-50 text-fleet-700 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Enhanced Security</h3>
              <p className="text-gray-600">
                Protect your assets with automated alerts for unauthorized usage, geofence violations, and more.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Get started with autotrace in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-fleet-600 text-white flex items-center justify-center mb-6 text-xl font-bold">1</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Install Trackers</h3>
              <p className="text-gray-600">
                Quickly install our plug-and-play GPS trackers in your vehicles
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-fleet-600 text-white flex items-center justify-center mb-6 text-xl font-bold">2</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Connect Platform</h3>
              <p className="text-gray-600">
                Set up your account and connect your vehicles to our cloud platform
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-fleet-600 text-white flex items-center justify-center mb-6 text-xl font-bold">3</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Start Tracking</h3>
              <p className="text-gray-600">
                Monitor your fleet in real-time through our intuitive dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-fleet-700 mb-2">10k+</p>
              <p className="text-gray-600">Vehicles Tracked</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-fleet-700 mb-2">1.2M</p>
              <p className="text-gray-600">Miles Monitored</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-fleet-700 mb-2">98%</p>
              <p className="text-gray-600">Uptime Guarantee</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-fleet-700 mb-2">24/7</p>
              <p className="text-gray-600">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-fleet-600 to-fleet-700 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to transform your fleet management?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-3xl mx-auto">
            Join thousands of businesses that trust autotrace for their vehicle tracking needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              className="bg-white text-fleet-700 hover:bg-gray-100"
              size="lg"
              onClick={() => navigate('/register')}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-fleet-700"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="h-6 w-6 text-fleet-400" />
                <h3 className="text-xl font-bold">autotrace</h3>
              </div>
              <p className="text-gray-400">
                The ultimate solution for vehicle tracking and fleet management.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <address className="not-italic text-gray-400">
                <p className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  123 Fleet Street, San Francisco, CA
                </p>
                <p className="flex items-center mb-2">
                  <Send className="h-4 w-4 mr-2" />
                  info@autotrace.com
                </p>
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Mon-Fri: 9AM - 5PM PST
                </p>
              </address>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} autotrace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
