import { useState, useEffect } from 'react';
import { Server } from '@shared/schema';
import { useRealVPN } from '@/hooks/use-real-vpn';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Shield, Globe, Wifi, ArrowUpDown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/lib/utils';
import VPNConnectionVisualization from './vpn-connection-visualization';

export default function VPNConnectionPanel() {
  const { toast } = useToast();
  const {
    isConnected,
    connectionStatus,
    currentServer,
    remoteIP,
    downloadSpeed,
    uploadSpeed,
    dataUsed,
    connectionTime,
    connect,
    disconnect
  } = useRealVPN();
  
  const [selectedServerId, setSelectedServerId] = useState<string>('');

  // Fetch available servers
  const { data: servers = [] } = useQuery<Server[]>({
    queryKey: ['/api/servers'],
  });

  // Set first server as default if none selected
  useEffect(() => {
    if (servers.length > 0 && !selectedServerId && !currentServer) {
      setSelectedServerId(servers[0].id.toString());
    }
  }, [servers, selectedServerId, currentServer]);

  // Format connection time (HH:MM:SS)
  const formatConnectionTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle connect/disconnect button click
  const handleConnectionToggle = async () => {
    if (isConnected) {
      await disconnect();
    } else {
      const server = servers.find(s => s.id.toString() === selectedServerId);
      if (!server) {
        toast({
          title: 'Server Not Found',
          description: 'Please select a valid server',
          variant: 'destructive'
        });
        return;
      }
      await connect(server);
    }
  };

  return (
    <Card className="border-gray-800 bg-gray-950/70 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-xl">
          <Shield className="w-5 h-5 mr-2 text-blue-400" />
          Real VPN Connection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Visual VPN Connection Representation */}
        <VPNConnectionVisualization />
        
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' || connectionStatus === 'disconnecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500'
              }`} />
              <span className="text-sm font-medium">Status:</span>
            </div>
            <span className="text-sm">
              {connectionStatus === 'connected' ? 'Connected' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               connectionStatus === 'disconnecting' ? 'Disconnecting...' :
               'Disconnected'}
            </span>
          </div>

          {/* Server Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium">Server:</span>
            </div>
            {currentServer ? (
              <span className="text-sm">{currentServer.name}, {currentServer.country}</span>
            ) : (
              <Select 
                value={selectedServerId} 
                onValueChange={setSelectedServerId}
                disabled={connectionStatus !== 'disconnected'}
              >
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Select server" />
                </SelectTrigger>
                <SelectContent>
                  {servers.map(server => (
                    <SelectItem key={server.id} value={server.id.toString()}>
                      {server.name}, {server.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* IP Address (only shown when connected) */}
          {isConnected && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">IP Address:</span>
              </div>
              <span className="text-sm font-mono">{remoteIP || 'Assigning...'}</span>
            </div>
          )}

          {/* Connection Time (only shown when connected) */}
          {isConnected && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium">Connection Time:</span>
              </div>
              <span className="text-sm font-mono">{formatConnectionTime(connectionTime)}</span>
            </div>
          )}

          {/* Data Transfer Statistics (only shown when connected) */}
          {isConnected && (
            <div className="space-y-3 mt-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Download</span>
                  <span>{downloadSpeed.toFixed(1)} Mbps</span>
                </div>
                <Progress value={Math.min(downloadSpeed, 100)} className="h-2" />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Upload</span>
                  <span>{uploadSpeed.toFixed(1)} Mbps</span>
                </div>
                <Progress value={Math.min(uploadSpeed, 100)} className="h-2" />
              </div>
              
              <div className="flex items-center justify-between text-xs mt-2">
                <div className="flex items-center">
                  <ArrowUpDown className="w-3 h-3 mr-1" />
                  <span>Data Used:</span>
                </div>
                <span>{formatBytes(dataUsed * 1024)}</span>
              </div>
            </div>
          )}

          {/* Connect / Disconnect Button */}
          <Button 
            onClick={handleConnectionToggle}
            disabled={
              connectionStatus === 'connecting' || 
              connectionStatus === 'disconnecting' || 
              (!selectedServerId && !currentServer)
            }
            variant={isConnected ? "destructive" : "default"}
            className="w-full mt-2"
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}