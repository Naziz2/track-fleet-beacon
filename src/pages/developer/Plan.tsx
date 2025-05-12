
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

const DeveloperPlan = () => {
  // In a real application, this would come from the user's profile in Supabase
  const currentPlan = {
    name: "Professional",
    price: 29.99,
    billingPeriod: "monthly",
    renewalDate: "2025-06-12",
    status: "active",
    features: [
      "50 vehicles",
      "Priority support",
      "Advanced analytics",
      "API access"
    ]
  };
  
  const availablePlans = [
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
      current: true,
    },
    {
      id: 3,
      name: "Enterprise",
      price: 99.99,
      features: ["Unlimited vehicles", "24/7 support", "Custom analytics", "API access", "White labeling"],
      isPopular: false,
    },
  ];
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Plan Overview</h1>
      
      <Card className="mb-8 border-fleet-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Plan: {currentPlan.name}
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              {currentPlan.status.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            <span className="text-2xl font-bold">${currentPlan.price}</span>/month
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Next billing date</p>
            <p>{currentPlan.renewalDate}</p>
          </div>
          
          <div>
            <p className="font-medium mb-2">Plan Features:</p>
            <ul className="space-y-2">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <ShieldCheck className="h-5 w-5 text-fleet-500 mr-2 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel Subscription</Button>
          <Button>Manage Billing</Button>
        </CardFooter>
      </Card>
      
      <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {availablePlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`${plan.isPopular ? "border-fleet-500 shadow-lg" : ""} ${plan.current ? "bg-gray-50" : ""}`}
          >
            {plan.isPopular && (
              <div className="bg-fleet-500 text-white text-center py-1 text-sm">
                MOST POPULAR
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
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
              <Button 
                className="w-full" 
                variant={plan.current ? "secondary" : plan.isPopular ? "default" : "outline"}
                disabled={plan.current}
              >
                {plan.current ? "Current Plan" : "Switch to Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DeveloperPlan;
