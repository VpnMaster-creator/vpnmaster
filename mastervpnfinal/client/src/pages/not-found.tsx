import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-950 to-gray-900">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="flex items-center mb-8">
          <Shield className="h-8 w-8 text-blue-500 mr-2" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            MasterVPN
          </h1>
        </div>
        
        <Card className="max-w-md w-full border-gray-800 bg-gray-950/70 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">404</CardTitle>
            <CardDescription className="text-xl text-gray-400">Page Not Found</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-6">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <footer className="py-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} MasterVPN. All rights reserved.
      </footer>
    </div>
  );
}