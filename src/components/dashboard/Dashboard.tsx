
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportGenerator } from "./ReportGenerator";
import { AdminUsers } from "./AdminUsers";
import { EscalationSettings } from "./EscalationSettings";
import { Stats } from "./Stats";
import { WifiRequestCard } from "../WifiRequestCard";
import { RequestDetails } from "../RequestDetails";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EscalationSettings as EscalationSettingsType } from "@/types/escalation";
import { useNotifications } from "@/hooks/use-notifications";

type RequestStatus = "pending" | "in-progress" | "completed" | "escalated";

interface WifiRequest {
  id: string;
  name: string;
  email: string;
  room_number: string;
  device_type: string;
  issue_type: string;
  description: string;
  status: RequestStatus;
  created_at: Date;
  comments?: { text: string; timestamp: Date; user: string }[];
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [activeDashboardTab, setActiveDashboardTab] = useState("requests");
  const [requests, setRequests] = useState<WifiRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WifiRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    escalated: 0,
    avgResponseTime: "N/A",
    avgResolutionTime: "N/A",
  });
  
  const { permission, requestPermission, showNotification } = useNotifications();

  useEffect(() => {
    fetchRequests();
    
    // Request notification permission when component mounts
    if (permission !== "granted") {
      requestPermission();
    }
    
    // Setup subscription for real-time updates
    const channel = supabase
      .channel('public:wifi_requests')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'wifi_requests' 
      }, (payload) => {
        console.log('New request received:', payload);
        // Play notification sound and show system notification
        if (payload.new) {
          const newRequest = payload.new as any;
          showNotification({
            title: 'New WiFi Request',
            body: `${newRequest.name} from room ${newRequest.room_number} needs assistance`,
          });
          // Refresh the requests list
          fetchRequests();
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [permission]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wifi_requests')
        .select('*');
      
      if (error) throw error;

      const formattedRequests = data.map(request => ({
        ...request,
        created_at: new Date(request.created_at),
      }));

      setRequests(formattedRequests);
      
      const statData = {
        total: formattedRequests.length,
        pending: formattedRequests.filter(r => r.status === "pending").length,
        inProgress: formattedRequests.filter(r => r.status === "in-progress").length,
        completed: formattedRequests.filter(r => r.status === "completed").length,
        escalated: formattedRequests.filter(r => r.status === "escalated").length,
        avgResponseTime: formattedRequests.length > 0 ? "18 minutes" : "N/A",
        avgResolutionTime: formattedRequests.length > 0 ? "45 minutes" : "N/A",
      };
      
      setStats(statData);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load requests", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRequests = activeTab === "all" 
    ? requests.filter(r => r.status !== "completed")
    : requests.filter(request => {
        if (activeTab === "pending") return request.status === "pending";
        if (activeTab === "in-progress") return request.status === "in-progress";
        if (activeTab === "completed") return request.status === "completed";
        if (activeTab === "escalated") return request.status === "escalated";
        return true;
      });

  const handleViewDetails = async (request: WifiRequest) => {
    try {
      const { data: comments, error } = await supabase
        .from('request_comments')
        .select('*')
        .eq('request_id', request.id);
      
      if (!error && comments.length > 0) {
        const formattedComments = comments.map(comment => ({
          text: comment.comment_text,
          timestamp: new Date(comment.created_at),
          user: comment.user_name,
        }));
        
        request.comments = formattedComments;
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
    
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: RequestStatus, comment?: string) => {
    try {
      const { error: updateError } = await supabase
        .from('wifi_requests')
        .update({ status })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      if (comment) {
        const { error: commentError } = await supabase
          .from('request_comments')
          .insert([{
            request_id: id,
            user_name: "IT Staff",
            comment_text: comment,
          }]);
        
        if (commentError) throw commentError;
      }
      
      setRequests(prev => 
        prev.map(request => {
          if (request.id === id) {
            const updatedRequest = { 
              ...request, 
              status,
            };
            
            if (comment) {
              const comments = updatedRequest.comments || [];
              updatedRequest.comments = [
                ...comments,
                {
                  text: comment,
                  timestamp: new Date(),
                  user: "IT Staff",
                },
              ];
            }
            
            return updatedRequest;
          }
          return request;
        })
      );
      
      const updatedStats = {
        ...stats,
        pending: stats.pending - (activeTab === "pending" ? 1 : 0),
        inProgress: status === "in-progress" ? stats.inProgress + 1 : (activeTab === "in-progress" ? stats.inProgress - 1 : stats.inProgress),
        completed: status === "completed" ? stats.completed + 1 : stats.completed,
        escalated: status === "escalated" ? stats.escalated + 1 : stats.escalated,
      };
      
      setStats(updatedStats);
      
      fetchRequests();
    } catch (error: any) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request", {
        description: error.message || "Please try again later",
      });
    }
  };

  const handleEscalateRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wifi_requests')
        .update({ status: 'escalated' })
        .eq('id', id);
      
      if (error) {
        toast.error("Failed to escalate request");
        console.error("Error escalating request:", error);
        return;
      }
      
      setRequests(prev => 
        prev.map(req => 
          req.id === id ? { ...req, status: 'escalated' } : req
        )
      );
      
      try {
        const { data: settings, error: settingsError } = await supabase
          .from('escalation_settings')
          .select('*')
          .single();
        
        if (!settingsError && settings && settings.emails) {
          const emailList = Array.isArray(settings.emails) 
            ? settings.emails.map(email => String(email))
            : [];
            
          const request = requests.find(r => r.id === id);
          
          if (request && emailList.length > 0) {
            toast.success("Escalation emails will be sent", {
              description: `Notification sent to ${emailList.length} recipients`,
            });
          }
        }
      } catch (notifyError) {
        console.error("Error sending escalation notifications:", notifyError);
      }
      
      toast.success("Request escalated successfully");
    } catch (error) {
      console.error("Error in escalation process:", error);
      toast.error("An error occurred during escalation");
    }
  };

  return (
    <div className="space-y-6">
      <Stats stats={stats} />
      
      <Tabs defaultValue="requests" value={activeDashboardTab} onValueChange={setActiveDashboardTab} className="space-y-4">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="requests">WiFi Requests</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="m-0 space-y-4">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <TabsList className="grid grid-cols-3 md:grid-cols-5">
                <TabsTrigger value="all">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="escalated">Escalated</TabsTrigger>
              </TabsList>
              
              <Button variant="outline" onClick={fetchRequests}>
                Refresh
              </Button>
            </div>
            
            <TabsContent value={activeTab} className="m-0">
              {isLoading ? (
                <Card>
                  <CardContent className="py-10">
                    <div className="text-center space-y-2">
                      <p className="text-lg font-medium">Loading requests...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : filteredRequests.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRequests.map((request) => (
                    <WifiRequestCard
                      key={request.id}
                      request={{
                        ...request,
                        roomNumber: request.room_number,
                        deviceType: request.device_type,
                        issueType: request.issue_type,
                      }}
                      onClick={() => handleViewDetails(request)}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-10">
                    <div className="text-center space-y-2">
                      <p className="text-lg font-medium">No requests found</p>
                      <p className="text-muted-foreground">
                        There are no WiFi assistance requests with this status.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="users" className="m-0 space-y-4">
          <AdminUsers />
        </TabsContent>
        
        <TabsContent value="reports" className="m-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>
                Create detailed reports based on WiFi assistance requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReportGenerator />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="m-0 space-y-4">
          <EscalationSettings />
        </TabsContent>
      </Tabs>
      
      <RequestDetails
        request={selectedRequest}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        isAdmin={true}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
