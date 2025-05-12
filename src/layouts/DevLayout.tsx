import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/router';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  Menu,
} from 'lucide-react';
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

// Import the AlertProcessor
import AlertProcessor from "@/components/AlertProcessor";

const DevLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error("Sign out failed:", error);
      toast({
        title: "Sign out failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="h-full flex">
      <AlertProcessor />
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="md:hidden absolute left-4 top-4"
            onClick={toggleMenu}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 pt-6">
          <SheetHeader className="pl-6 pb-4">
            <SheetTitle>
              <Link href="/" className="flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" />
                Dashboard
              </Link>
            </SheetTitle>
            <SheetDescription>
              Navigate your workspace.
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            <ul className="space-y-1">
              <li>
                <Link href="/developer/alerts" className="block px-6 py-2 hover:bg-secondary">
                  Alerts
                </Link>
              </li>
              {/* Add more links here as needed */}
            </ul>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-gray-50 dark:bg-gray-900 dark:border-gray-700">
        <div className="p-4">
          <Link href="/" className="block font-bold text-lg">
            Dashboard
          </Link>
        </div>
        <nav className="flex-1">
          <ul>
            <li>
              <Link href="/developer/alerts" className={cn("block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800", router.pathname === '/developer/alerts' ? 'font-semibold bg-gray-100 dark:bg-gray-800' : '')}>
                Alerts
              </Link>
            </li>
            {/* Add more links here as needed */}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-4">
        {children}
      </main>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full absolute right-4 top-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 mr-4">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/profile">
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DevLayout;
