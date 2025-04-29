import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useVPN } from "@/hooks/use-vpn";
import { formatDistance } from "date-fns";
import { Loader2, PowerOff, Power, Shield, Clock, Download, Upload, Database, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerList } from "@/components/server-list";
import { ConnectionHistory } from "@/components/connection-history";
import { AppLayout } from "@/components/app-layout";
import { formatBytes } from "@/lib/utils";
import VPNConnectionPanel from "@/components/vpn-connection-panel";
import VPNTestPanel from "@/components/vpn-test-panel";

export default function DashboardPage() {
  const { user } = useAuth();
  const { 
    connectionStatus, 
    selectedServer, 
    connectionTime,
    ipAddress,
    downloadSpeed,
    uploadSpeed,
    dataUsed,
    connectToServer, 
    disconnectFromServer 
  } = useVPN();
  
  const isConnecting = connectionStatus === "connecting";
  const isConnected = connectionStatus === "connected";
  const isDisconnecting = connectionStatus === "disconnecting";
  
  // Format connection time
  const formattedTime = (() => {
    const hours = Math.floor(connectionTime / 3600);
    const minutes = Math.floor((connectionTime % 3600) / 60);
    const seconds = connectionTime % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  })();
  
  // Handle connection
  const handleConnection = async () => {
    if (isConnected || isDisconnecting) {
      await disconnectFromServer();
    } else if (selectedServer && !isConnecting) {
      await connectToServer(selectedServer.id);
    }
  };
  
  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real VPN Connection Panel */}
        <Card className="col-span-1 h-[340px] lg:row-span-2 border-gray-800 bg-gray-950/70 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Real VPN Connection</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100%-5rem)] overflow-y-auto">
            <VPNConnectionPanel />
          </CardContent>
        </Card>
        
        {/* Connection Status Card */}
        <Card className="col-span-1 h-[340px] lg:row-span-2 border-gray-800 bg-gray-950/70 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[calc(100%-5rem)]">
            <div 
              className={`relative w-52 h-52 rounded-full flex items-center justify-center mb-4 
                ${isConnected ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/30 border border-green-500/30' : 
                  isConnecting || isDisconnecting ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/30 border border-yellow-500/30' : 
                  'bg-gradient-to-br from-red-500/20 to-rose-600/30 border border-red-500/30'}`}
            >
              <div className="absolute inset-3 rounded-full border border-gray-700/50 bg-gray-950/80"></div>
              <Button 
                variant="ghost"
                size="icon"
                onClick={handleConnection}
                disabled={isConnecting || isDisconnecting || (!selectedServer && !isConnected)}
                className={`w-40 h-40 rounded-full relative z-10 transition-all
                  ${isConnected ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20' : 
                    isConnecting || isDisconnecting ? 'text-yellow-500 bg-yellow-500/10' : 
                    'text-red-500 bg-red-500/10 hover:bg-red-500/20'}`}
              >
                {isConnecting || isDisconnecting ? (
                  <Loader2 className="h-16 w-16 animate-spin" />
                ) : isConnected ? (
                  <PowerOff className="h-16 w-16" />
                ) : (
                  <Power className="h-16 w-16" />
                )}
              </Button>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                {isConnected ? "Connected" : 
                 isConnecting ? "Connecting..." : 
                 isDisconnecting ? "Disconnecting..." : 
                 "Not Connected"}
              </h3>
              {selectedServer && (
                <p className="text-sm text-gray-400">
                  {selectedServer.name}, {selectedServer.country}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Connection Details */}
        <Card className="col-span-1 lg:col-span-2 border-gray-800 bg-gray-950/70 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Connection Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex flex-col items-center text-center p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <Shield className="h-8 w-8 text-blue-400 mb-2" />
                <span className="text-sm text-gray-400">Status</span>
                <span className={`text-sm font-semibold ${isConnected ? 'text-green-500' : 'text-gray-300'}`}>
                  {isConnected ? "Protected" : "Unprotected"}
                </span>
              </div>
              
              <div className="flex flex-col items-center text-center p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <MapPin className="h-8 w-8 text-blue-400 mb-2" />
                <span className="text-sm text-gray-400">IP Address</span>
                <span className="text-sm font-semibold text-gray-300">
                  {ipAddress || "Not connected"}
                </span>
              </div>
              
              <div className="flex flex-col items-center text-center p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <Clock className="h-8 w-8 text-blue-400 mb-2" />
                <span className="text-sm text-gray-400">Duration</span>
                <span className="text-sm font-semibold text-gray-300">
                  {isConnected ? formattedTime : "00:00:00"}
                </span>
              </div>
              
              <div className="flex flex-col items-center text-center p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                <Database className="h-8 w-8 text-blue-400 mb-2" />
                <span className="text-sm text-gray-400">Data Used</span>
                <span className="text-sm font-semibold text-gray-300">
                  {isConnected ? formatBytes(dataUsed * 1024) : "0 KB"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Download/Upload Speed */}
        <Card className="col-span-1 lg:col-span-2 border-gray-800 bg-gray-950/70 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Network Performance</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-6">
            <div className="flex flex-col bg-gray-900/50 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center mb-2">
                <Download className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-sm text-gray-300">Download</span>
              </div>
              
              <div className="mt-2">
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full" 
                    style={{ width: `${isConnected ? Math.min(100, downloadSpeed) : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">0 Mbps</span>
                  <span className="text-xs text-gray-400">100 Mbps</span>
                </div>
                <div className="text-center mt-1">
                  <span className="text-xl font-semibold text-white">{isConnected ? downloadSpeed : 0}</span>
                  <span className="text-sm text-gray-400 ml-1">Mbps</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col bg-gray-900/50 rounded-lg border border-gray-800 p-4">
              <div className="flex items-center mb-2">
                <Upload className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-sm text-gray-300">Upload</span>
              </div>
              
              <div className="mt-2">
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full" 
                    style={{ width: `${isConnected ? Math.min(100, uploadSpeed) : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">0 Mbps</span>
                  <span className="text-xs text-gray-400">100 Mbps</span>
                </div>
                <div className="text-center mt-1">
                  <span className="text-xl font-semibold text-white">{isConnected ? uploadSpeed : 0}</span>
                  <span className="text-sm text-gray-400 ml-1">Mbps</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Server Selection */}
        <Card className="col-span-1 lg:col-span-2 border-gray-800 bg-gray-950/70 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Server Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <ServerList />
          </CardContent>
        </Card>

        {/* Connection History */}
        <Card className="col-span-1 lg:col-span-1 border-gray-800 bg-gray-950/70 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Recent Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <ConnectionHistory />
          </CardContent>
        </Card>
        
        {/* VPN Test */}
        <Card className="col-span-1 lg:col-span-3 border-gray-800 bg-gray-950/70 shadow-lg">
          <CardContent className="pt-6">
            <VPNTestPanel />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}