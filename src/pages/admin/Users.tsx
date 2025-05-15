import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/toastUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { User } from '@supabase/supabase-js';
import { PlusCircle, Copy, CheckCircle, User as UserIcon } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

// Define a schema for user creation
const userCreationSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  first_name: z.string().min(2, { message: "First name must be at least 2 characters." }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  phone: z.string().regex(/^(\+?\d{1,4}?)?\d{8,15}$/, { message: "Invalid phone number" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  created_at: z.string().datetime().optional(),
})

// Define a type for the form values based on the schema
type UserCreationFormValues = z.infer<typeof userCreationSchema>

// Dummy user data for quick add
const dummyUsersData = [
  {
    email: 'user1@example.com',
    first_name: 'Alice',
    last_name: 'Smith',
    phone: '+15551234567',
    address: '123 Highland, Some Crrek, AL',
  },
  {
    email: 'user2@example.com',
    first_name: 'Bob',
    last_name: 'Johnson',
    phone: '+15552345678',
    address: '456 Lowland, Anytown, GA',
  },
  {
    email: 'user3@example.com',
    first_name: 'Charlie',
    last_name: 'Brown',
    phone: '+15553456789',
    address: '789 Upland, Spring V, TX',
  },
];

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingUsers, setIsAddingUsers] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // React Hook Form setup
  const form = useForm<UserCreationFormValues>({
    resolver: zodResolver(userCreationSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      address: "",
    },
  })

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to fetch users from Supabase
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch users', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle form submission for creating a new user
  const onSubmit = async (values: UserCreationFormValues) => {
    setIsCreatingUser(true);
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: 'defaultpassword', // Temporary password
        options: {
          data: {
            first_name: values.first_name,
            last_name: values.last_name,
            phone: values.phone,
            address: values.address,
          },
        },
      });
      
      if (authError) {
        throw authError;
      }
      
      // Insert user data into the 'users' table
      const { error: tableError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user?.id,
            email: values.email,
            first_name: values.first_name,
            last_name: values.last_name,
            phone: values.phone,
            address: values.address,
            created_at: new Date().toISOString(),
          },
        ]);
      
      if (tableError) {
        throw tableError;
      }
      
      toast.success('User created successfully!');
      fetchUsers(); // Refresh the user list
      form.reset(); // Reset the form
    } catch (error: any) {
      toast.error('Failed to create user', {
        description: error.message,
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleAddUsers = async () => {
    setIsAddingUsers(true);
    
    try {
      // Format the user data correctly with IDs for each user
      const formattedUsers = dummyUsersData.map(user => ({
        ...user,
        id: crypto.randomUUID(), // Add a random UUID for the id field
      }));
      
      const { error } = await supabase
        .from('users')
        .insert(formattedUsers);
      
      if (error) throw error;
      
      toast.success('Users added successfully!');
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      toast.error('Failed to add users', {
        description: error.message,
      });
    } finally {
      setIsAddingUsers(false);
    }
  };

  // Function to copy user details
  const copyUserDetails = (user: any) => {
    const details = `
      Email: ${user.email || 'N/A'}
      Name: ${user.first_name} ${user.last_name || ''}
      Phone: ${user.phone || 'N/A'}
      Address: ${user.address || 'N/A'}
    `;
    navigator.clipboard.writeText(details);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000); // Reset after 3 seconds
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Manage Users</CardTitle>
          <CardDescription>
            View, add, and manage users of the Autotrace system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-between items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account by filling out the form below.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isCreatingUser}>
                      {isCreatingUser ? "Creating..." : "Create User"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button
              variant="secondary"
              onClick={handleAddUsers}
              disabled={isAddingUsers}
            >
              {isAddingUsers ? 'Adding Users...' : 'Add Dummy Users'}
            </Button>
          </div>

          {isLoading ? (
            <p>Loading users...</p>
          ) : users.length > 0 ? (
            <ScrollArea>
              <Table>
                <TableCaption>A list of your registered users.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.first_name} {user.last_name}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>{user.address || 'N/A'}</TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyUserDetails(user)}
                          disabled={isCopied}
                        >
                          {isCopied ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                          {isCopied ? "Copied!" : "Copy Details"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <UserIcon className="h-10 w-10 text-gray-400" />
              <p className="text-gray-500">No users found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
