import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { Server, ConnectionHistory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getRandomInt } from "@/lib/utils";

type VPNStatus = "disconnected" | "connecting" | "connected" | "disconnecting";

type VPNContextType = {
  status: VPNStatus;
  activeServer: Server | null;
  connectionTime: number | null;
  dataUsed: number | null;
  connectMutation: UseMutationResult<ConnectionHistory, Error, { serverId: number }>;
  disconnectMutation: UseMutationResult<ConnectionHistory, Error, void>;
  connectionHistory: ConnectionHistory[];
  servers: Server[];
  isLoadingServers: boolean;
  isLoadingHistory: boolean;
};

export const VPNContext = createContext<VPNContextType | null>(null);

export function VPNProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<VPNStatus>("disconnected");
  const [activeServer, setActiveServer] = useState<Server | null>(null);
  const [connectionTime, setConnectionTime] = useState<number | null>(null);
  const [dataUsed, setDataUsed] = useState<number | null>(null);
  const [connectionStartTime, setConnectionStartTime] = useState<Date | null>(null);
  const [dataSizeInterval, setDataSizeInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch all VPN servers
  const {
    data: servers = [],
    isLoading: isLoadingServers,
  } = useQuery<Server[]>({
    queryKey: ['/api/servers'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/servers');
        if (!res.ok) {
          throw new Error('Failed to load servers');
        }
        return await res.json();
      } catch (error) {
        // Return mock data for standalone development
        return [
          {
            id: 1,
            name: 'US East',
            country: 'United States',
            countryCode: 'US',
            city: 'New York',
            ping: 45,
            load: 40,
            latitude: '40.7128',
            longitude: '-74.0060',
            status: 'available',
          },
          {
            id: 2,
            name: 'UK London',
            country: 'United Kingdom',
            countryCode: 'GB',
            city: 'London',
            ping: 60,
            load: 35,
            latitude: '51.5074',
            longitude: '-0.1278',
            status: 'available',
          },
          {
            id: 3,
            name: 'Germany Frankfurt',
            country: 'Germany',
            countryCode: 'DE',
            city: 'Frankfurt',
            ping: 55,
            load: 30,
            latitude: '50.1109',
            longitude: '8.6821',
            status: 'available',
          },
          {
            id: 4,
            name: 'Japan Tokyo',
            country: 'Japan',
            countryCode: 'JP',
            city: 'Tokyo',
            ping: 120,
            load: 25,
            latitude: '35.6762',
            longitude: '139.6503',
            status: 'available',
          },
          {
            id: 5,
            name: 'Australia Sydney',
            country: 'Australia',
            countryCode: 'AU',
            city: 'Sydney',
            ping: 160,
            load: 20,
            latitude: '-33.8688',
            longitude: '151.2093',
            status: 'available',
          },
          {
            id: 6,
            name: 'Singapore',
            country: 'Singapore',
            countryCode: 'SG',
            city: 'Singapore',
            ping: 130,
            load: 45,
            latitude: '1.3521',
            longitude: '103.8198',
            status: 'available',
          },
        ];
      }
    },
  });

  // Fetch connection history
  const {
    data: connectionHistory = [],
    isLoading: isLoadingHistory,
  } = useQuery<ConnectionHistory[]>({
    queryKey: ['/api/connection-history'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/connection-history');
        if (!res.ok) {
          throw new Error('Failed to load connection history');
        }
        return await res.json();
      } catch (error) {
        console.error('Error fetching connection history:', error);
        return [];
      }
    },
  });

  // Connect to a VPN server
  const connectMutation = useMutation({
    mutationFn: async ({ serverId }: { serverId: number }) => {
      try {
        const server = servers.find(s => s.id === serverId);
        if (!server) {
          throw new Error('Server not found');
        }

        const res = await apiRequest('POST', '/api/connect', { serverId });
        return await res.json();
      } catch (error) {
        // For standalone development, simulate connection
        setStatus('connecting');
        
        // Find the selected server
        const server = servers.find(s => s.id === serverId);
        if (!server) {
          throw new Error('Server not found');
        }
        
        // Simulate a successful connection after a delay
        return new Promise<ConnectionHistory>((resolve) => {
          setTimeout(() => {
            const connectionData = {
              id: Math.floor(Math.random() * 1000),
              userId: 1,
              serverId,
              ipAddress: `192.168.${getRandomInt(1, 255)}.${getRandomInt(1, 255)}`,
              connectedAt: new Date(),
              disconnectedAt: null,
              duration: null,
              dataUsed: null
            };
            
            setActiveServer(server);
            setConnectionStartTime(new Date());
            setStatus('connected');
            
            resolve(connectionData as ConnectionHistory);
          }, 2000); // Simulate a 2-second connection process
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/connection-history'] });
      
      toast({
        title: "Connected",
        description: `Successfully connected to ${activeServer?.name}`,
      });
      
      // Start tracking data usage
      const interval = setInterval(() => {
        // Randomly increase data usage every second
        setDataUsed((prev) => {
          const newValue = (prev || 0) + getRandomInt(10000, 50000); // 10-50KB per interval
          return newValue;
        });
      }, 1000);
      
      setDataSizeInterval(interval);
    },
    onError: (error: Error) => {
      setStatus('disconnected');
      setActiveServer(null);
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disconnect from VPN
  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!activeServer) {
        throw new Error('Not connected to any server');
      }
      
      try {
        setStatus('disconnecting');
        const res = await apiRequest('POST', '/api/disconnect');
        return await res.json();
      } catch (error) {
        // For standalone development, simulate disconnection
        setStatus('disconnecting');
        
        // Simulate disconnection after a delay
        return new Promise<ConnectionHistory>((resolve) => {
          setTimeout(() => {
            const disconnectionData = {
              id: Math.floor(Math.random() * 1000),
              userId: 1,
              serverId: activeServer.id,
              ipAddress: `192.168.${getRandomInt(1, 255)}.${getRandomInt(1, 255)}`,
              connectedAt: connectionStartTime || new Date(),
              disconnectedAt: new Date(),
              duration: connectionTime || 0,
              dataUsed: dataUsed || 0
            };
            
            resolve(disconnectionData as ConnectionHistory);
          }, 1500); // Simulate a 1.5-second disconnection process
        });
      }
    },
    onSuccess: () => {
      // Stop the data usage interval
      if (dataSizeInterval) {
        clearInterval(dataSizeInterval);
        setDataSizeInterval(null);
      }
      
      setStatus('disconnected');
      setActiveServer(null);
      setConnectionTime(null);
      setDataUsed(null);
      setConnectionStartTime(null);
      
      queryClient.invalidateQueries({ queryKey: ['/api/connection-history'] });
      
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from VPN",
      });
    },
    onError: (error: Error) => {
      setStatus('connected'); // Revert back to connected state
      toast({
        title: "Disconnection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate connection time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (status === 'connected' && connectionStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - connectionStartTime.getTime()) / 1000);
        setConnectionTime(diffInSeconds);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [status, connectionStartTime]);

  return (
    <VPNContext.Provider
      value={{
        status,
        activeServer,
        connectionTime,
        dataUsed,
        connectMutation,
        disconnectMutation,
        connectionHistory,
        servers,
        isLoadingServers,
        isLoadingHistory,
      }}
    >
      {children}
    </VPNContext.Provider>
  );
}

export function useVPN() {
  const context = useContext(VPNContext);
  if (!context) {
    throw new Error("useVPN must be used within a VPNProvider");
  }
  return context;
}