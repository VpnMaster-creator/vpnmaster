import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // If no user is logged in, redirect to auth page
  if (!user) {
    setLocation("/auth");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <Navbar />
      <div className="container mx-auto px-4 pb-12 pt-4 md:flex md:gap-8">
        <Sidebar className="hidden md:block md:w-64 shrink-0" />
        <main className="flex-1 space-y-6 mt-8 md:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
}