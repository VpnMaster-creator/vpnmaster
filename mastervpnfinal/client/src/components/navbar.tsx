import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  Menu, 
  User, 
  LogOut, 
  Shield, 
  Settings,
  BarChart
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/auth");
  };
  
  const isAdmin = user?.role === "admin";
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-8 flex">
          <Link to="/" className="flex items-center">
            <Shield className="h-6 w-6 text-blue-500 mr-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              MasterVPN
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center gap-6 text-sm">
          <Link to="/">
            <Button 
              variant="ghost" 
              className={cn("text-gray-300 hover:text-white", 
                location === "/" && "text-white"
              )}
            >
              Dashboard
            </Button>
          </Link>
          <Link to="/servers">
            <Button 
              variant="ghost" 
              className={cn("text-gray-300 hover:text-white", 
                location === "/servers" && "text-white"
              )}
            >
              Servers
            </Button>
          </Link>
          <Link to="/profile">
            <Button 
              variant="ghost" 
              className={cn("text-gray-300 hover:text-white", 
                location === "/profile" && "text-white"
              )}
            >
              Profile
            </Button>
          </Link>
          <Link to="/settings">
            <Button 
              variant="ghost" 
              className={cn("text-gray-300 hover:text-white", 
                location === "/settings" && "text-white"
              )}
            >
              Settings
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/admin">
              <Button 
                variant="ghost" 
                className={cn("text-gray-300 hover:text-white", 
                  location === "/admin" && "text-white"
                )}
              >
                Admin
              </Button>
            </Link>
          )}
        </nav>
        
        {/* Mobile Menu */}
        <div className="md:hidden flex-1">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-gray-950 border-gray-800 text-white p-0">
              <Sidebar setIsMobileMenuOpen={setIsMobileMenuOpen} />
            </SheetContent>
          </Sheet>
        </div>
        
        {/* User Menu */}
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                <User className="h-4 w-4" />
                <span>{user?.username}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-950 border-gray-800">
              <DropdownMenuItem 
                className="text-gray-300 cursor-pointer hover:text-white hover:bg-gray-900" 
                onClick={() => setLocation("/profile")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-gray-300 cursor-pointer hover:text-white hover:bg-gray-900" 
                onClick={() => setLocation("/settings")}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem 
                  className="text-gray-300 cursor-pointer hover:text-white hover:bg-gray-900" 
                  onClick={() => setLocation("/admin")}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem 
                className="text-red-400 cursor-pointer hover:text-red-300 hover:bg-gray-900" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}