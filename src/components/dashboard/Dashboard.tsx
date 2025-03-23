
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportGenerator } from "./ReportGenerator";
import { Stats } from "./Stats";
import { WifiRequestCard } from "../WifiRequestCard";
import { RequestDetails } from "../RequestDetails";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  useEffect(() => {
    fetchRequests();
  }, []);

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
      
      // Calculate stats
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
    ? requests 
    : requests.filter(request => {
        if (activeTab === "pending") return request.status === "pending";
        if (activeTab === "in-progress") return request.status === "in-progress";
        if (activeTab === "completed") return request.status === "completed";
        if (activeTab === "escalated") return request.status === "escalated";
        return true;
      });

  const handleViewDetails = async (request: WifiRequest) => {
    // Fetch comments if available
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
      // Update request status
      const { error: updateError } = await supabase
        .from('wifi_requests')
        .update({ status })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Add comment if provided
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
      
      // Update local state
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
      
      // Refresh stats
      const updatedStats = {
        ...stats,
        pending: activeTab === "pending" ? stats.pending - 1 : stats.pending,
        inProgress: status === "in-progress" ? stats.inProgress + 1 : (activeTab === "in-progress" ? stats.inProgress - 1 : stats.inProgress),
        completed: status === "completed" ? stats.completed + 1 : stats.completed,
        escalated: status === "escalated" ? stats.escalated + 1 : stats.escalated,
      };
      
      setStats(updatedStats);
      
    } catch (error: any) {
      console.error("Error updating request:", error);
      toast.error("Failed to update request", {
        description: error.message || "Please try again later",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Stats stats={stats} />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
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
      
      <Card className="mt-8">
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
