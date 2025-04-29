import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useVPN } from "@/hooks/use-vpn";
import { Server } from "@shared/schema";
import { Loader2, Star, CheckCircle2, GlobeIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export function ServerList() {
  const [searchTerm, setSearchTerm] = useState("");
  const { connectionStatus, selectedServer, setSelectedServer } = useVPN();
  
  const { data: servers = [], isLoading } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
    // The queryFn is provided by the default setup
  });
  
  const filteredServers = servers.filter((server) => {
    const searchString = `${server.name} ${server.country} ${server.city}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });
  
  const handleServerSelect = (server: Server) => {
    if (connectionStatus === "disconnected") {
      setSelectedServer(server);
    }
  };
  
  // Calculate latency for a server (in a real implementation this would be an actual ping)
  const getLatency = (serverId: number) => {
    // Simulate latency based on server ID
    // In a real implementation, this would be actual ping data
    const baseLatency = 30;
    const variance = 100;
    return (serverId % 10) * variance + baseLatency;
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          placeholder="Search by country, city, or server name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setSearchTerm("")}
          >
            ×
          </Button>
        )}
      </div>
      
      <div className="rounded-md border border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-gray-950/80 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-[250px] text-gray-300">Server Location</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-right text-gray-300">Latency</TableHead>
                  <TableHead className="text-right text-gray-300">Load</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24 text-gray-400">
                      No servers found. Try a different search term.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServers.map((server) => {
                    const isSelected = selectedServer?.id === server.id;
                    const latency = getLatency(server.id);
                    
                    return (
                      <TableRow 
                        key={server.id}
                        className={`cursor-pointer hover:bg-gray-900/50 ${isSelected ? 'bg-gray-900/80' : ''} ${
                          connectionStatus !== "disconnected" && !isSelected ? 'opacity-50' : ''
                        }`}
                        onClick={() => handleServerSelect(server)}
                      >
                        <TableCell className="font-medium py-3">
                          <div className="flex items-center">
                            <div className="mr-3 w-6">
                              {server.isRecommended && <Star className="h-4 w-4 text-yellow-400" />}
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            </div>
                            <div>
                              <div className="flex items-center">
                                <GlobeIcon className="h-4 w-4 mr-2 text-blue-400" />
                                <span>{server.name}</span>
                                {server.isRecommended && (
                                  <Badge className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30" variant="outline">
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-400">
                                {server.city}, {server.country}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={`${
                              server.status === 'online' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                              'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`} 
                            variant="outline"
                          >
                            {server.status === 'online' ? 'Online' : 'Maintenance'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className={`
                            ${latency < 50 ? 'text-green-400' : 
                            latency < 100 ? 'text-blue-400' : 
                            latency < 150 ? 'text-amber-400' : 'text-red-400'}
                          `}>
                            {latency} ms
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="w-16 bg-gray-800 rounded-full h-2 ml-auto">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                              style={{ width: `${server.load}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {server.load}%
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}