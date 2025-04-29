import express from 'express';
import http from 'http';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from '@shared/schema';
import { storage } from './storage';
import { IncomingMessage, ServerResponse } from 'http';

// Type for active VPN connections
type ActiveConnection = {
  userId: number;
  serverId: number;
  connectionId: number;
  socket: any; // Using any to fix type conflicts between browser WebSocket and ws types
  startTime: Date;
  proxyTarget: string;
  dataUsed: number;
  lastSpeedUpdate: {
    timestamp: number;
    bytesDown: number;
    bytesUp: number;
  };
};

// Active connections map: connectionId -> connection data
const activeConnections = new Map<number, ActiveConnection>();

// Get server regional IP based on location
function getRegionalIP(server: Server): string {
  // In a real implementation, this would use actual server IPs based on location
  // For demonstration, we'll generate pseudo-regional IPs
  const regionMap: Record<string, string> = {
    'United States': '104.16.132.',
    'Germany': '130.41.228.',
    'Japan': '162.159.135.',
    'Singapore': '172.67.75.',
    'United Kingdom': '104.26.5.',
    'Canada': '104.18.114.',
    'Australia': '103.21.244.',
    'France': '172.64.163.',
    'Netherlands': '195.85.23.',
    'Brazil': '190.93.246.',
    // Default
    'Unknown': '192.168.1.'
  };

  const baseIP = regionMap[server.country] || regionMap['Unknown'];
  // Generate last octet based on server ID to ensure consistency
  const lastOctet = 1 + (server.id % 254);
  
  return `${baseIP}${lastOctet}`;
}

// Setup proxy middleware for VPN functionality
export function setupVPNProxy(app: express.Express) {
  // Endpoint that will be proxied through VPN
  app.use('/api/vpn-tunnel', (req, res, next) => {
    // Extract connection ID from headers or query params
    const connectionId = parseInt(req.headers['x-vpn-connection-id'] as string || 
                                req.query.connectionId as string);
    
    if (!connectionId || !activeConnections.has(connectionId)) {
      return res.status(401).json({ error: 'Not connected to VPN' });
    }
    
    // Get connection data
    const connection = activeConnections.get(connectionId)!;
    
    // Create proxy middleware dynamically based on the selected server
    // Cast to any to work around type issues with http-proxy-middleware
    const proxyOptions: any = {
      target: connection.proxyTarget,
      changeOrigin: true,
      pathRewrite: {
        '^/api/vpn-tunnel': '/' // Remove the /api/vpn-tunnel prefix
      },
      // Track data usage
      onProxyRes: (proxyRes: any, req: any, res: any) => {
        // Update download stats
        const contentLength = parseInt(proxyRes.headers['content-length'] || '0');
        connection.dataUsed += contentLength;
        
        // Update last speed data
        const now = Date.now();
        connection.lastSpeedUpdate.bytesDown += contentLength;
        
        // Send stats update roughly every second
        if (now - connection.lastSpeedUpdate.timestamp >= 1000) {
          // Calculate speeds (bytes per second -> Mbps)
          const elapsedSeconds = (now - connection.lastSpeedUpdate.timestamp) / 1000;
          const downloadSpeed = (connection.lastSpeedUpdate.bytesDown / elapsedSeconds * 8) / (1024 * 1024);
          const uploadSpeed = (connection.lastSpeedUpdate.bytesUp / elapsedSeconds * 8) / (1024 * 1024);
          
          // Send stats to client
          connection.socket.send(JSON.stringify({
            type: 'stats',
            data: {
              downloadSpeed,
              uploadSpeed,
              dataUsed: connection.dataUsed / 1024 // Convert to KB
            }
          }));
          
          // Reset counters
          connection.lastSpeedUpdate = {
            timestamp: now,
            bytesDown: 0,
            bytesUp: 0
          };
        }
      },
      onProxyReq: (proxyReq: any, req: any, res: any) => {
        // Update upload stats based on request content length
        const contentLength = parseInt(req.headers['content-length'] || '0');
        connection.dataUsed += contentLength;
        connection.lastSpeedUpdate.bytesUp += contentLength;
      }
    };
    
    const proxy = createProxyMiddleware(proxyOptions);
    
    // Apply the proxy middleware
    proxy(req, res, next);
  });
  
  // IP check endpoint that's accessible via the VPN tunnel
  app.get('/ip-check', (req, res) => {
    // This endpoint would be accessed via the proxy at /api/vpn-tunnel/ip-check
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress) || 'unknown';
    
    // Get region information based on connection
    let location = 'Unknown';
    
    // In a real implementation, this would use GeoIP lookup
    // For demo, we'll use the same mapping we use for VPN servers
    const regionMap = {
      'United States': '104.16.132.',
      'Germany': '130.41.228.',
      'Japan': '162.159.135.',
      'Singapore': '172.67.75.',
      'United Kingdom': '104.26.5.',
      'Canada': '104.18.114.',
      'Australia': '103.21.244.',
      'France': '172.64.163.',
      'Netherlands': '195.85.23.',
      'Brazil': '190.93.246.',
      'Unknown': '192.168.1.'
    };
    
    for (const [country, ipPrefix] of Object.entries(regionMap)) {
      if (ip.startsWith(ipPrefix)) {
        location = country;
        break;
      }
    }
    
    res.json({
      ip,
      location,
      timestamp: new Date().toISOString(),
      headers: req.headers,
      vpn: true
    });
  });
  
  // API endpoint to get VPN server status and statistics
  app.get('/api/vpn-status', (req, res) => {
    const stats = {
      activeConnections: activeConnections.size,
      servers: [] as { id: number, name: string, country: string, activeUsers: number }[]
    };
    
    // Collect server usage stats
    const serverUsage = new Map<number, number>();
    for (const connection of activeConnections.values()) {
      const count = serverUsage.get(connection.serverId) || 0;
      serverUsage.set(connection.serverId, count + 1);
    }
    
    // Add server data
    storage.getAllServers().then(servers => {
      servers.forEach(server => {
        stats.servers.push({
          id: server.id,
          name: server.name,
          country: server.country,
          activeUsers: serverUsage.get(server.id) || 0
        });
      });
      
      res.json(stats);
    }).catch(error => {
      res.status(500).json({ error: 'Failed to get VPN status' });
    });
  });
}

// Setup WebSockets for real-time VPN stats and control
export function setupVPNWebSockets(server: http.Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  
  wss.on('connection', (socket) => {
    console.log('WebSocket client connected');
    
    socket.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'connect': {
            const { serverId, connectionId } = data;
            
            // Validate the connection ID exists in database first
            try {
              const server = await storage.getServer(serverId);
              if (!server) {
                socket.send(JSON.stringify({
                  type: 'error',
                  data: { error: 'Server not found' }
                }));
                return;
              }
              
              // Get proxy target based on server location
              const serverIP = getRegionalIP(server);
              const proxyTarget = `http://${serverIP}:80`;
              
              // Store connection in active connections map
              activeConnections.set(connectionId, {
                userId: 0, // This would be set from database in a real implementation
                serverId,
                connectionId,
                socket,
                startTime: new Date(),
                proxyTarget,
                dataUsed: 0,
                lastSpeedUpdate: {
                  timestamp: Date.now(),
                  bytesDown: 0,
                  bytesUp: 0
                }
              });
              
              // Send connection confirmation with assigned IP
              socket.send(JSON.stringify({
                type: 'connected',
                data: { remoteIP: serverIP }
              }));
              
              console.log(`VPN connection established: ${connectionId} to server ${serverId}`);
            } catch (error) {
              console.error('Error establishing VPN connection:', error);
              socket.send(JSON.stringify({
                type: 'error',
                data: { error: 'Failed to establish VPN connection' }
              }));
            }
            break;
          }
          
          case 'disconnect': {
            const { connectionId } = data;
            if (activeConnections.has(connectionId)) {
              const connection = activeConnections.get(connectionId)!;
              
              // Remove connection from active connections
              activeConnections.delete(connectionId);
              
              // Send disconnect confirmation
              socket.send(JSON.stringify({
                type: 'disconnected',
                data: { }
              }));
              
              console.log(`VPN connection terminated: ${connectionId}`);
            }
            break;
          }
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        socket.send(JSON.stringify({
          type: 'error',
          data: { error: 'Invalid request' }
        }));
      }
    });
    
    socket.on('close', () => {
      console.log('WebSocket client disconnected');
      
      // Clean up any connections associated with this socket
      for (const [connectionId, connection] of activeConnections.entries()) {
        if (connection.socket === socket) {
          activeConnections.delete(connectionId);
          console.log(`VPN connection terminated due to socket close: ${connectionId}`);
        }
      }
    });
  });
}