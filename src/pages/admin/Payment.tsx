
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  WalletCards, 
  WalletMinimal, 
  Receipt, 
  BadgeDollarSign,
  ShieldCheck,
  UserCog,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";

const AdminPayment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Mock payment data - would come from Supabase in a real app
  const payments = [
    {
      id: "INV-001",
      developerName: "TechFusion Labs",
      developerEmail: "contact@techfusion.com",
      amount: 29.99,
      date: "2025-05-01",
      status: "completed",
      plan: "Professional",
    },
    {
      id: "INV-002",
      developerName: "DataDrive Solutions",
      developerEmail: "info@datadrive.io",
      amount: 99.99,
      date: "2025-05-03",
      status: "completed",
      plan: "Enterprise",
    },
    {
      id: "INV-003",
      developerName: "MobileTrack Inc.",
      developerEmail: "billing@mobiletrack.com",
      amount: 29.99,
      date: "2025-05-10",
      status: "failed",
      plan: "Professional",
    },
    {
      id: "INV-004",
      developerName: "Smart Fleet Systems",
      developerEmail: "admin@smartfleet.co",
      amount: 9.99,
      date: "2025-05-11",
      status: "pending",
      plan: "Basic",
    },
    {
      id: "INV-005",
      developerName: "Connected Vehicles Ltd",
      developerEmail: "finance@connectedvehicles.net",
      amount: 29.99,
      date: "2025-05-12",
      status: "completed",
      plan: "Professional",
    },
  ];
  
  // Summary statistics
  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, payment) => sum + payment.amount, 0);
  const pendingRevenue = payments.filter(p => p.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0);
  const failedRevenue = payments.filter(p => p.status === 'failed').reduce((sum, payment) => sum + payment.amount, 0);
  
  // Filter payments based on search term, date, and status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.developerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.developerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    // Simple date filter - in a real app would have proper date range filtering
    const matchesDate = dateFilter === 'all' || (
      dateFilter === 'today' && payment.date === '2025-05-12' || 
      dateFilter === 'week' && ['2025-05-10', '2025-05-11', '2025-05-12'].includes(payment.date)
    );
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handlePaymentAction = (id: string, action: string) => {
    toast.success(`Payment ${id} ${action} successfully`);
  };
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payment Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <BadgeDollarSign className="mr-2 text-green-600" />
              ${totalRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">From {payments.length} payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Revenue</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <CreditCard className="mr-2 text-yellow-600" />
              ${pendingRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{payments.filter(p => p.status === 'pending').length} pending payments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed Payments</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Receipt className="mr-2 text-red-600" />
              ${failedRevenue.toFixed(2)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{payments.filter(p => p.status === 'failed').length} failed payments</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View and manage all payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="md:w-1/3">
              <Label htmlFor="search" className="sr-only">Search</Label>
              <Input
                id="search"
                placeholder="Search by developer or invoice ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                className="border rounded-md px-3 py-2 bg-white"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
              </select>
              <select
                className="border rounded-md px-3 py-2 bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Developer</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.developerName}</div>
                          <div className="text-sm text-muted-foreground">{payment.developerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{payment.plan}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePaymentAction(payment.id, 'viewed')}
                        >
                          View
                        </Button>
                        {payment.status === 'failed' && (
                          <Button
                            size="sm"
                            onClick={() => handlePaymentAction(payment.id, 'retried')}
                          >
                            Retry
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payments found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayment;
