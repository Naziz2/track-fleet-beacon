
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Developer } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const DeveloperProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [cin, setCin] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('developers')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setProfileData(data);
        
        // Set form data
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setCin(data.cin || "");
        setPhone(data.phone || "");
        setCompanyName(data.company_name || "");
        setAddress(data.address || "");
        setEmail(data.email || user.email || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    try {
      const updates = {
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        cin: cin,
        phone: phone,
        company_name: companyName,
        address: address,
        email: email,
      };
      
      const { error } = await supabase.from('developers').update(updates).eq('id', user.id);
      
      if (error) throw error;
      
      setProfileData({
        ...profileData!,
        ...updates,
      });
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };
  
  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
        {!isEditing && (
          <Button onClick={toggleEdit}>
            Edit Profile
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Manage your personal information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Email address cannot be changed.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cin">CIN</Label>
                    <Input
                      id="cin"
                      value={cin}
                      onChange={(e) => setCin(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button variant="outline" type="button" onClick={toggleEdit}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-medium">{profileData?.first_name} {profileData?.last_name}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{profileData?.email || user?.email}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">CIN</p>
                  <p className="font-medium">{profileData?.cin || "Not set"}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="font-medium">{profileData?.phone || "Not set"}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Company</p>
                  <p className="font-medium">{profileData?.company_name || "Not set"}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="font-medium">{profileData?.address || "Not set"}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Account Created</p>
                  <p className="font-medium">
                    {profileData?.created_at 
                      ? new Date(profileData.created_at).toLocaleDateString() 
                      : "Unknown"}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Admin</p>
                  <p className="font-medium">{profileData?.admin_uid || "Not assigned"}</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Assignments</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="font-medium">Assigned Vehicles</div>
                    <div className="text-sm text-muted-foreground">
                      {profileData?.assigned_vehicle_ids?.length || 0} vehicles
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="font-medium">Assigned Users</div>
                    <div className="text-sm text-muted-foreground">
                      {profileData?.assigned_user_ids?.length || 0} users
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-muted-foreground">Update your password</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Notification Preferences</h4>
                <p className="text-sm text-muted-foreground">Manage your notification settings</p>
              </div>
              <Button variant="outline">Configure</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeveloperProfile;
