import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useVPN } from "@/hooks/use-vpn";
import {
  LayoutDashboard,
  Globe,
  UserCircle,
  Settings,
  Clock,
  Shield,
  BarChart,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  className?: string;
  setIsMobileMenuOpen?: (isOpen: boolean) => void;
}

export function Sidebar({ className, setIsMobileMenuOpen }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const { connectionStatus } = useVPN();
  const [location, setLocation] = useLocation();
  
  const isAdmin = user?.role === "admin";
  const isConnected = connectionStatus === "connected";
  
  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setLocation("/auth");
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };
  
  const handleLinkClick = (path: string) => {
    setLocation(path);
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Mobile Header - Only visible in the mobile menu sheet */}
      {setIsMobileMenuOpen && (
        <div className="flex items-center h-16 px-2 mb-4 border-b border-gray-800">
          <Link href="/" className="flex items-center ml-2">
            <Shield className="h-6 w-6 text-blue-500 mr-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              MasterVPN
            </span>
          </Link>
        </div>
      )}
      
      {/* User Info - Only visible in the mobile menu sheet */}
      {setIsMobileMenuOpen && user && (
        <div className="px-4 py-4 mb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
              <UserCircle className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="font-medium">{user.username}</h3>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
          </div>
          
          <div className="mt-4 bg-gray-900/60 rounded-md p-2 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-gray-400">Status:</span>
              <span className={isConnected ? "text-green-400" : "text-red-400"}>
                {isConnected ? "Protected" : "Unprotected"}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <ScrollArea className="flex-1">
        <div className="px-2 py-2">
          <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Main
          </h3>
          <nav className="grid gap-1">
            <Button
              variant="ghost"
              className={cn(
                "justify-start font-normal",
                location === "/" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900/80"
              )}
              onClick={() => handleLinkClick("/")}
            >
              <LayoutDashboard className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
            
            <Button
              variant="ghost"
              className={cn(
                "justify-start font-normal",
                location === "/servers" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900/80"
              )}
              onClick={() => handleLinkClick("/servers")}
            >
              <Globe className="mr-2 h-5 w-5" />
              Servers
            </Button>
            
            <Button
              variant="ghost"
              className={cn(
                "justify-start font-normal",
                location === "/history" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900/80"
              )}
              onClick={() => handleLinkClick("/history")}
            >
              <Clock className="mr-2 h-5 w-5" />
              Connection History
            </Button>
          </nav>
          
          <h3 className="mt-6 mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Account
          </h3>
          <nav className="grid gap-1">
            <Button
              variant="ghost"
              className={cn(
                "justify-start font-normal",
                location === "/profile" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900/80"
              )}
              onClick={() => handleLinkClick("/profile")}
            >
              <UserCircle className="mr-2 h-5 w-5" />
              Profile
            </Button>
            
            <Button
              variant="ghost"
              className={cn(
                "justify-start font-normal",
                location === "/settings" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900/80"
              )}
              onClick={() => handleLinkClick("/settings")}
            >
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </Button>
            
            {isAdmin && (
              <>
                <h3 className="mt-6 mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Admin
                </h3>
                <Button
                  variant="ghost"
                  className={cn(
                    "justify-start font-normal",
                    location === "/admin" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-900/80"
                  )}
                  onClick={() => handleLinkClick("/admin")}
                >
                  <BarChart className="mr-2 h-5 w-5" />
                  Admin Dashboard
                </Button>
              </>
            )}
          </nav>
        </div>
      </ScrollArea>
      
      <div className="mt-auto p-4 border-t border-gray-800">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-gray-900/80"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Log out
        </Button>
      </div>
    </div>
  );
}