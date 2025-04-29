import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Server } from "@shared/schema";
import { 
  BarChart3, 
  Users, 
  Server as ServerIcon, 
  Activity,
  Trash2,
  Shield,
  Search,
  Globe,
  RefreshCw,
  Loader2,
  List,
  Plus
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [serverSearchTerm, setServerSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Check if the user is an admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, setLocation, toast]);
  
  // Fetch server stats
  const { data: serverStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    // Default queryFn provided by the setup
  });
  
  // Fetch all users
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    // Default queryFn provided by the setup
  });
  
  // Fetch all servers
  const { data: servers = [], isLoading: isLoadingServers } = useQuery<Server[]>({
    queryKey: ["/api/servers"],
    // Default queryFn provided by the setup
  });
  
  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      
      return userId;
    },
    onSuccess: (userId) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted",
        variant: "success",
      });
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred while deleting the user",
        variant: "destructive",
      });
    },
  });
  
  // Handle delete user
  const handleDeleteUser = async (userId: number) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      await deleteUserMutation.mutateAsync(userId);
    }
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter((u) => {
    if (!userSearchTerm) return true;
    
    const searchString = `${u.username}`.toLowerCase();
    return searchString.includes(userSearchTerm.toLowerCase());
  });
  
  // Filter servers based on search term
  const filteredServers = servers.filter((s) => {
    if (!serverSearchTerm) return true;
    
    const searchString = `${s.name} ${s.country} ${s.city}`.toLowerCase();
    return searchString.includes(serverSearchTerm.toLowerCase());
  });
  
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            queryClient.invalidateQueries({ queryKey: ["/api/servers"] });
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="border-gray-800 bg-gray-950/70 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">
                {isLoadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  serverStats?.totalUsers || 0
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gray-950/70 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Servers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ServerIcon className="h-5 w-5 text-green-500 mr-2" />
              <div className="text-2xl font-bold">
                {isLoadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  serverStats?.totalServers || 0
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gray-950/70 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Active Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-amber-500 mr-2" />
              <div className="text-2xl font-bold">
                {isLoadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  serverStats?.activeConnections || 0
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gray-800 bg-gray-950/70 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Server Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 text-red-500 mr-2" />
              <div className="text-2xl font-bold">
                {isLoadingStats ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  `${serverStats?.serverLoad || 0}%`
                )}
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-800 rounded-full h-2">
              <div
                className={`bg-gradient-to-r ${
                  (serverStats?.serverLoad || 0) > 70
                    ? "from-red-500 to-red-600"
                    : (serverStats?.serverLoad || 0) > 40
                    ? "from-amber-500 to-amber-600"
                    : "from-green-500 to-green-600"
                } h-2 rounded-full`}
                style={{ width: `${serverStats?.serverLoad || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Management Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="users" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="servers" className="flex-1">
            <Globe className="h-4 w-4 mr-2" />
            Servers
          </TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="border-gray-800 bg-gray-950/70 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">User Management</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8 w-full sm:w-[200px] bg-gray-900/50 border-gray-800"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-800 overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-gray-950/80 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="text-gray-300 w-[50px]">#</TableHead>
                        <TableHead className="text-gray-300">Username</TableHead>
                        <TableHead className="text-gray-300">Role</TableHead>
                        <TableHead className="text-gray-300">Created At</TableHead>
                        <TableHead className="text-right text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingUsers ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                            No users found. Try a different search term.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mr-2">
                                  <Users className="h-4 w-4 text-gray-400" />
                                </div>
                                {u.username}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={`${
                                  u.role === "admin" 
                                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30" 
                                    : "bg-green-500/20 text-green-300 border-green-500/30"
                                }`} 
                                variant="outline"
                              >
                                {u.role === "admin" ? "Admin" : "User"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(u.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={user?.id === u.id || deleteUserMutation.isPending}
                              >
                                {deleteUserMutation.isPending && selectedUser?.id === u.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Servers Tab */}
        <TabsContent value="servers">
          <Card className="border-gray-800 bg-gray-950/70 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Server Management</CardTitle>
                  <CardDescription>
                    View and manage VPN servers
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search servers..."
                      className="pl-8 w-full sm:w-[200px] bg-gray-900/50 border-gray-800"
                      value={serverSearchTerm}
                      onChange={(e) => setServerSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Server
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-800 overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-gray-950/80 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="text-gray-300 w-[50px]">#</TableHead>
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Location</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300">Load</TableHead>
                        <TableHead className="text-right text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingServers ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                          </TableCell>
                        </TableRow>
                      ) : filteredServers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                            No servers found. Try a different search term.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredServers.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.id}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center mr-2">
                                  <Shield className="h-4 w-4 text-blue-400" />
                                </div>
                                {s.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {s.city}, {s.country}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={`${
                                  s.status === 'online' 
                                    ? "bg-green-500/20 text-green-300 border-green-500/30" 
                                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                }`} 
                                variant="outline"
                              >
                                {s.status === 'online' ? 'Online' : 'Maintenance'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-[60px] bg-gray-800 rounded-full h-2">
                                  <div
                                    className={`${
                                      s.load > 70
                                        ? "bg-red-500"
                                        : s.load > 40
                                        ? "bg-amber-500"
                                        : "bg-green-500"
                                    } h-2 rounded-full`}
                                    style={{ width: `${s.load}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">{s.load}%</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/20"
                                >
                                  <List className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}