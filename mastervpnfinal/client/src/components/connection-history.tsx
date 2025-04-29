import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2, MapPin, Calendar, Clock, Database } from "lucide-react";
import { ConnectionHistory as ConnectionHistoryType } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatBytes } from "@/lib/utils";

export function ConnectionHistory() {
  const { user } = useAuth();
  
  const { data: connections = [], isLoading, error } = useQuery<ConnectionHistoryType[]>({
    queryKey: [`/api/connections/history/${user?.id}`],
    enabled: !!user,
    // Default queryFn provided by the setup
  });
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-4 text-red-500 text-sm">
        Error loading connection history
      </div>
    );
  }
  
  if (connections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        No connection history available
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {connections.map((connection) => (
          <div 
            key={connection.id} 
            className="p-4 rounded-lg border border-gray-800 bg-gray-900/50 space-y-3"
          >
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-400" />
              <span className="font-medium text-gray-200">{connection.serverName}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-400">
                  {format(new Date(connection.connectedAt), "MMM d, yyyy")}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-400">
                  {formatDuration(connection.duration)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 col-span-2">
                <Database className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-400">
                  {formatBytes(connection.dataUsed * 1024)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}