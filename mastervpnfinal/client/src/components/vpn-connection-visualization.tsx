import { useState, useEffect } from 'react';
import { useRealVPN } from '@/hooks/use-real-vpn';
import { motion, AnimatePresence } from 'framer-motion';

export default function VPNConnectionVisualization() {
  const { isConnected, currentServer, remoteIP } = useRealVPN();
  
  // For the animation of data packets
  const [dataPackets, setDataPackets] = useState<{ id: number; direction: 'up' | 'down' }[]>([]);
  const [nextPacketId, setNextPacketId] = useState(0);
  
  // Simulate data packets flowing for visual effect
  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      // Add new packet
      const direction = Math.random() > 0.5 ? 'up' : 'down';
      setDataPackets(prev => [...prev, { id: nextPacketId, direction }]);
      setNextPacketId(prev => prev + 1);
      
      // Remove old packets to prevent memory issues
      setDataPackets(prev => prev.filter(p => p.id > nextPacketId - 10));
    }, 800);
    
    return () => clearInterval(interval);
  }, [isConnected, nextPacketId]);
  
  return (
    <div className="relative h-52 flex items-center justify-center">
      {/* Device (Computer) */}
      <div className="absolute left-6 bottom-8 z-10">
        <div className="w-16 h-10 bg-gray-800 rounded-t-md border border-gray-700 flex items-center justify-center">
          <div className="w-12 h-7 bg-blue-900/30 rounded-sm"></div>
        </div>
        <div className="w-20 h-2 bg-gray-700 rounded-b-sm mx-auto"></div>
      </div>
      
      {/* Server */}
      <div className="absolute right-6 bottom-8 z-10">
        <div className="w-14 h-14 bg-gray-800 rounded-md border border-gray-700 flex items-center justify-center">
          <div className="grid grid-cols-2 gap-1 p-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          </div>
        </div>
        <div className="w-10 h-6 bg-gray-700 mt-1 rounded-md mx-auto flex items-center justify-center">
          <div className="w-8 h-1 bg-gray-600 rounded-full"></div>
        </div>
      </div>
      
      {/* Connection line */}
      <div className="absolute inset-x-24 bottom-12 h-0.5 bg-gray-700 rounded-full"></div>
      
      {/* Connection status indicator */}
      <div className="absolute inset-x-0 bottom-20 flex justify-center">
        <div className={`px-3 py-1 rounded-full text-xs ${
          isConnected 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-red-500/20 text-red-400 border border-red-500/30'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      
      {/* Server location */}
      {currentServer && (
        <div className="absolute right-4 top-4 text-xs text-gray-400">
          Server: {currentServer.name}, {currentServer.country}
        </div>
      )}
      
      {/* IP address */}
      {isConnected && remoteIP && (
        <div className="absolute left-4 top-4 text-xs text-gray-400 font-mono">
          IP: {remoteIP}
        </div>
      )}
      
      {/* VPN tunnel visualization */}
      <div className={`absolute inset-x-24 bottom-[47px] h-5 rounded-full transition-all duration-700 ${
        isConnected ? 'bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-blue-500/30' : 'bg-transparent'
      }`}>
        {/* Data packets */}
        <AnimatePresence>
          {isConnected && dataPackets.map(packet => (
            <motion.div
              key={packet.id}
              className={`absolute w-2 h-2 ${packet.direction === 'up' ? 'bg-blue-500' : 'bg-green-500'} rounded-full`}
              initial={{ 
                x: packet.direction === 'up' ? 10 : '90%', 
                y: '50%',
                opacity: 0,
                scale: 0
              }}
              animate={{ 
                x: packet.direction === 'up' ? '90%' : 10, 
                y: '50%',
                opacity: 1,
                scale: 1
              }}
              exit={{ 
                opacity: 0,
                scale: 0
              }}
              transition={{ 
                duration: 0.8,
                ease: 'easeInOut'
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}