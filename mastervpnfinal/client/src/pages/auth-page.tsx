import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import worldMapImage from "@/assets/world-map-dark.svg";
import { useAuth } from "@/hooks/use-auth";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirect to dashboard if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Left side - Auth form */}
      <div className="flex w-full flex-col justify-center md:w-1/2 p-6 sm:p-8 lg:p-12">
        <div className="mx-auto mb-6 flex items-center">
          <Shield className="h-8 w-8 text-blue-500 mr-2" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            MasterVPN
          </h1>
        </div>
        
        <Card className="mx-auto w-full max-w-md border-gray-800 bg-gray-950/70 shadow-md">
          <CardHeader>
            <CardTitle className="text-xl text-white">{isLogin ? "Welcome back" : "Create an account"}</CardTitle>
            <CardDescription>
              {isLogin 
                ? "Enter your credentials to access your account" 
                : "Fill in your details to create a new account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLogin ? <LoginForm /> : <RegisterForm />}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Button 
                variant="link" 
                className="p-0 h-auto text-blue-400" 
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Sign up" : "Sign in"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Right side - Hero image and info */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-gray-900 to-gray-950 flex-col justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30">
          <img 
            src={worldMapImage} 
            alt="World map" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="z-10 relative">
          <h2 className="text-3xl font-bold text-white mb-6">Secure. Fast. Reliable.</h2>
          <p className="text-gray-300 mb-8 max-w-md">
            Access the internet securely and privately with MasterVPN's global network of high-speed servers.
            Protect your data with military-grade encryption.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <div className="text-2xl font-bold text-blue-400 mb-1">50+</div>
              <div className="text-sm text-gray-400">Global locations</div>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <div className="text-2xl font-bold text-emerald-400 mb-1">99.9%</div>
              <div className="text-sm text-gray-400">Uptime guarantee</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}