
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Shield, ShieldCheck, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminPlan = () => {
  const [showAddPlanForm, setShowAddPlanForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<number | null>(null);
  
  // Mock data for plans - in a real app, this would come from Supabase
  const [plans, setPlans] = useState([
    {
      id: 1,
      name: "Basic",
      price: 9.99,
      features: ["10 vehicles", "Standard support", "Basic analytics"],
      isPopular: false,
    },
    {
      id: 2,
      name: "Professional",
      price: 29.99,
      features: ["50 vehicles", "Priority support", "Advanced analytics", "API access"],
      isPopular: true,
    },
    {
      id: 3,
      name: "Enterprise",
      price: 99.99,
      features: ["Unlimited vehicles", "24/7 support", "Custom analytics", "API access", "White labeling"],
      isPopular: false,
    },
  ]);
  
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: 0,
    features: "",
    isPopular: false,
  });
  
  const handleAddPlan = () => {
    if (!newPlan.name || newPlan.price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const featuresArray = newPlan.features.split(',').map(f => f.trim());
    
    setPlans([
      ...plans,
      {
        id: plans.length + 1,
        name: newPlan.name,
        price: newPlan.price,
        features: featuresArray,
        isPopular: newPlan.isPopular,
      },
    ]);
    
    setNewPlan({
      name: "",
      price: 0,
      features: "",
      isPopular: false,
    });
    
    setShowAddPlanForm(false);
    toast.success("Plan added successfully");
  };
  
  const handleDeletePlan = (id: number) => {
    setPlans(plans.filter(plan => plan.id !== id));
    toast.success("Plan deleted successfully");
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Plan Management</h1>
          <p className="text-muted-foreground">Manage subscription plans for your customers</p>
        </div>
        <Button onClick={() => setShowAddPlanForm(!showAddPlanForm)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Plan
        </Button>
      </div>
      
      {showAddPlanForm && (
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle>Add New Plan</CardTitle>
            <CardDescription>Create a new subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input 
                  id="name"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                  placeholder="e.g. Basic, Premium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Monthly Price ($)</Label>
                <Input 
                  id="price"
                  type="number"
                  value={newPlan.price === 0 ? "" : newPlan.price}
                  onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                  placeholder="29.99"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="features">Features (comma separated)</Label>
              <Input 
                id="features"
                value={newPlan.features}
                onChange={(e) => setNewPlan({...newPlan, features: e.target.value})}
                placeholder="e.g. 10 vehicles, Standard support, Basic analytics"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPopular"
                checked={newPlan.isPopular}
                onChange={(e) => setNewPlan({...newPlan, isPopular: e.target.checked})}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isPopular">Mark as Popular Plan</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowAddPlanForm(false)}>Cancel</Button>
            <Button onClick={handleAddPlan}>Save Plan</Button>
          </CardFooter>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.isPopular ? "border-fleet-500 shadow-lg" : ""}>
            {plan.isPopular && (
              <div className="bg-fleet-500 text-white text-center py-1 text-sm">
                MOST POPULAR
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{plan.name}</CardTitle>
                <div className="flex space-x-2">
                  <Button size="icon" variant="ghost" onClick={() => setEditingPlan(plan.id)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeletePlan(plan.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                <span className="text-2xl font-bold">${plan.price}</span>/month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <ShieldCheck className="h-5 w-5 text-fleet-500 mr-2 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.isPopular ? "default" : "outline"}>
                View Subscribers
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Plan Statistics</CardTitle>
          <CardDescription>Overview of subscription plans</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Active Subscribers</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Basic</TableCell>
                <TableCell>$9.99</TableCell>
                <TableCell>124</TableCell>
                <TableCell>$1,238.76</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Professional</TableCell>
                <TableCell>$29.99</TableCell>
                <TableCell>86</TableCell>
                <TableCell>$2,579.14</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Enterprise</TableCell>
                <TableCell>$99.99</TableCell>
                <TableCell>14</TableCell>
                <TableCell>$1,399.86</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-bold">Total</TableCell>
                <TableCell></TableCell>
                <TableCell className="font-bold">224</TableCell>
                <TableCell className="font-bold">$5,217.76</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlan;
