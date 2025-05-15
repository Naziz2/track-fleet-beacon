import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/lib/toastUtils";
import { supabase } from "@/lib/supabase";

// Whitelist of emails that can access the registration page
const ALLOWED_CREATOR_EMAILS = ["admin@autotrace.com"];

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cin, setCin] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Check if there's a creator access code in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('accessCode');
    if (code === "autotrace2025creator") {
      setIsAuthorized(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);

    try {
      // Register with Supabase Auth
      const { data, error } = await signUp(email, password);
      
      if (error) {
        toast.error("Registration failed", {
          description: error.message,
        });
        return;
      }
      
      if (data?.user) {
        // Add admin details to the admins table
        const { error: profileError } = await supabase
          .from('admins')
          .insert({
            id: data.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            cin,
            phone,
            company_name: companyName,
            address,
            created_at: new Date().toISOString(),
          });
        
        if (profileError) {
          toast.error("Failed to create profile", {
            description: profileError.message,
          });
          return;
        }
        
        toast.success("Registration successful", {
          description: "You can now log in to your account",
        });
        
        navigate("/login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification check
  const handleVerifyAccess = () => {
    if (accessCode === "autotrace2025creator" || ALLOWED_CREATOR_EMAILS.includes(email)) {
      setIsAuthorized(true);
    } else {
      toast.error("Invalid access code");
    }
  };

  // If not authorized, show access verification screen
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#210F37] py-12 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#DCA06D] font-serif tracking-wider">
              <span className="text-4xl">A</span>utotrace
            </h1>
            <p className="mt-2 text-[#A55B4B]">Creator access required</p>
          </div>

          <Card className="border-[#4F1C51]/20 bg-white/95">
            <CardHeader>
              <CardTitle className="text-[#210F37]">Restricted Area</CardTitle>
              <CardDescription>
                This page is only accessible to the creator of Autotrace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Creator email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessCode">Access Code</Label>
                <Input
                  id="accessCode"
                  type="password"
                  placeholder="Enter creator access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-[#4F1C51] hover:bg-[#210F37]"
                onClick={handleVerifyAccess}
              >
                Verify Access
              </Button>
            </CardFooter>
            <div className="pb-4 text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-[#4F1C51] hover:text-[#210F37]"
              >
                Return to Login
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Original registration form for authorized users
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#210F37] py-12 px-4">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#DCA06D] font-serif tracking-wider">
            <span className="text-4xl">A</span>utotrace
          </h1>
          <p className="mt-2 text-[#A55B4B]">Register your company account</p>
        </div>

        <Card className="border-[#4F1C51]/20 bg-white/95">
          <CardHeader>
            <CardTitle className="text-[#210F37]">Create Admin Account</CardTitle>
            <CardDescription>
              Enter your information to create your administrator account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cin">CIN/ID Number</Label>
                    <Input
                      id="cin"
                      type="text"
                      value={cin}
                      onChange={(e) => setCin(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-[#4F1C51] hover:bg-[#210F37]" 
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
              <p className="text-sm text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-[#4F1C51] hover:text-[#210F37]"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
