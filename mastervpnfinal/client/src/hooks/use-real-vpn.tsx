import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { useToast } from './use-toast';
import { Server } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

// Type for the VPN connection status
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';

// Type for the WebSocket message
type VPNSocketMessage = {
  type: 'stats' | 'error' | 'connected' | 'disconnected';
  data: {
    downloadSpeed?: number;
    uploadSpeed?: number;
    dataUsed?: number;
    remoteIP?: string;
    error?: string;
  };
};

// Context type
type RealVPNContextType = {
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  currentServer: Server | null;
  downloadSpeed: number;
  uploadSpeed: number;
  dataUsed: number;
  connectionTime: number;
  remoteIP: string | null;
  connect: (server: Server) => Promise<void>;
  disconnect: () => Promise<void>;
};

const RealVPNContext = createContext<RealVPNContextType | null>(null);

export function RealVPNProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [currentServer, setCurrentServer] = useState<Server | null>(null);
  const [connectionId, setConnectionId] = useState<number | null>(null);
  const [connectionStartTime, setConnectionStartTime] = useState<number | null>(null);
  const [connectionTime, setConnectionTime] = useState(0);
  const [downloadSpeed, setDownloadSpeed] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [dataUsed, setDataUsed] = useState(0);
  const [remoteIP, setRemoteIP] = useState<string | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    newSocket.onmessage = (event) => {
      try {
        const message: VPNSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'stats':
            if (message.data.downloadSpeed !== undefined) {
              setDownloadSpeed(message.data.downloadSpeed);
            }
            if (message.data.uploadSpeed !== undefined) {
              setUploadSpeed(message.data.uploadSpeed);
            }
            if (message.data.dataUsed !== undefined) {
              setDataUsed(message.data.dataUsed);
            }
            break;
          case 'connected':
            if (message.data.remoteIP) {
              setRemoteIP(message.data.remoteIP);
            }
            break;
          case 'error':
            toast({
              title: 'VPN Error',
              description: message.data.error || 'Unknown error occurred',
              variant: 'destructive'
            });
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user, toast]);

  // Update connection time counter
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (connectionStatus === 'connected' && connectionStartTime) {
      interval = setInterval(() => {
        const now = Date.now();
        setConnectionTime(Math.floor((now - connectionStartTime) / 1000));
      }, 1000);
    } else if (connectionStatus !== 'connected') {
      setConnectionTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus, connectionStartTime]);

  // Connect to VPN server
  const connect = async (server: Server) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to connect to VPN',
        variant: 'destructive'
      });
      return;
    }

    try {
      setConnectionStatus('connecting');
      
      // Get client IP
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const clientIP = ipData.ip;
      
      // Start connection in the database
      const response = await apiRequest('POST', '/api/connect', {
        serverId: server.id,
        ipAddress: clientIP
      });
      
      const connectionData = await response.json();
      setConnectionId(connectionData.id);
      
      // Store connection ID in localStorage for the VPN test functionality
      localStorage.setItem('vpn_connection_id', connectionData.id.toString());
      
      // Tell the server to start proxying
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'connect',
          serverId: server.id,
          connectionId: connectionData.id
        }));
      }
      
      setCurrentServer(server);
      setConnectionStatus('connected');
      setConnectionStartTime(Date.now());
      
      toast({
        title: 'VPN Connected',
        description: `You are now connected to ${server.name}`,
      });
    } catch (error) {
      console.error('Failed to connect to VPN:', error);
      setConnectionStatus('disconnected');
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to VPN server',
        variant: 'destructive'
      });
    }
  };

  // Disconnect from VPN server
  const disconnect = async () => {
    if (connectionStatus !== 'connected' || !connectionId) return;
    
    try {
      setConnectionStatus('disconnecting');
      
      // Tell the server to stop proxying
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'disconnect',
          connectionId
        }));
      }
      
      // End connection in the database
      await apiRequest('POST', '/api/disconnect', {
        connectionId,
        dataUsed
      });
      
      setConnectionStatus('disconnected');
      setCurrentServer(null);
      setConnectionId(null);
      setConnectionStartTime(null);
      setDownloadSpeed(0);
      setUploadSpeed(0);
      setDataUsed(0);
      setRemoteIP(null);
      
      // Clear connection ID from localStorage
      localStorage.removeItem('vpn_connection_id');
      
      toast({
        title: 'VPN Disconnected',
        description: 'You have been disconnected from the VPN',
      });
    } catch (error) {
      console.error('Failed to disconnect from VPN:', error);
      toast({
        title: 'Disconnect Failed',
        description: error instanceof Error ? error.message : 'Failed to disconnect from VPN server',
        variant: 'destructive'
      });
      
      // Force disconnect on client side if server disconnection fails
      setConnectionStatus('disconnected');
      setCurrentServer(null);
      setConnectionId(null);
      setConnectionStartTime(null);
      
      // Clear connection ID from localStorage even on error
      localStorage.removeItem('vpn_connection_id');
    }
  };

  return (
    <RealVPNContext.Provider value={{
      isConnected: connectionStatus === 'connected',
      connectionStatus,
      currentServer,
      downloadSpeed,
      uploadSpeed,
      dataUsed,
      connectionTime,
      remoteIP,
      connect,
      disconnect
    }}>
      {children}
    </RealVPNContext.Provider>
  );
}

export function useRealVPN() {
  const context = useContext(RealVPNContext);
  if (!context) {
    throw new Error('useRealVPN must be used within a RealVPNProvider');
  }
  return context;
}