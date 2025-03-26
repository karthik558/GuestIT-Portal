
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
import { DatePickerWithRange } from "../ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { UserProfile } from "@/types/user";

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
  was_escalated?: boolean;
  comments?: { text: string; timestamp: Date; user: string }[];
}

interface DashboardProps {
  userProfile: UserProfile | null;
}

export function Dashboard({ userProfile }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [activeDashboardTab, setActiveDashboardTab] = useState("requests");
  const [requests, setRequests] = useState<WifiRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<WifiRequest[]>([]);
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
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  
  const { permission, requestPermission, showNotification } = useNotifications();

  useEffect(() => {
    fetchRequests();
    
    if (permission !== "granted") {
      requestPermission();
    }
    
    const channel = supabase
      .channel('public:wifi_requests')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'wifi_requests' 
      }, (payload) => {
        console.log('New request received:', payload);
        if (payload.new) {
          const newRequest = payload.new as any;
          showNotification({
            title: 'New WiFi Request',
            body: `${newRequest.name} from room ${newRequest.room_number} needs assistance`,
          });
          fetchRequests();
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [permission]);

  useEffect(() => {
    if (!requests.length) return;
    
    filterRequests();
  }, [requests, activeTab, date]);

  const isDateInRange = (dateToCheck: Date): boolean => {
    if (!date || !date.from) return true;
    
    try {
      // Handle edge case where date.to might be undefined
      if (date.from && !date.to) {
        // If only from date is provided, check if target date is on or after from date
        return dateToCheck >= date.from;
      }
      
      // Normal case with from and to dates
      return isWithinInterval(dateToCheck, {
        start: date.from,
        end: date.to || date.from
      });
    } catch (error) {
      console.error("Error checking date range:", error);
      return false;
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];
    
    // Apply date filter
    if (date && date.from) {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.created_at);
        return isDateInRange(requestDate);
      });
    }
    
    // Apply status filter
    if (activeTab !== "all") {
      if (activeTab === "escalated") {
        // Include both currently escalated and completed tasks that were once escalated
        filtered = filtered.filter(request => 
          request.status === "escalated" || (request.status === "completed" && request.was_escalated)
        );
      } else if (activeTab === "completed") {
        filtered = filtered.filter(request => request.status === "completed");
      } else if (activeTab === "pending") {
        filtered = filtered.filter(request => request.status === "pending");
      } else if (activeTab === "in-progress") {
        filtered = filtered.filter(request => request.status === "in-progress");
      }
    } else {
      // For "all" tab, show everything except completed and non-escalated
      filtered = filtered.filter(r => 
        r.status !== "completed" || (r.status === "completed" && r.was_escalated)
      );
    }
    
    setFilteredRequests(filtered);
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wifi_requests')
        .select('*');
      
      if (error) throw error;

      const formattedRequests = data.map(request => {
        // Track if a request was ever escalated
        const was_escalated = request.status === "escalated" || Boolean(request.was_escalated);
        
        return {
          ...request,
          created_at: new Date(request.created_at),
          was_escalated
        };
      });

      setRequests(formattedRequests);
      
      calculateStats(formattedRequests);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load requests", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (allRequests: WifiRequest[]) => {
    let filteredByDate = [...allRequests].filter(request => 
      isDateInRange(new Date(request.created_at))
    );
    
    const statData = {
      total: filteredByDate.length,
      pending: filteredByDate.filter(r => r.status === "pending").length,
      inProgress: filteredByDate.filter(r => r.status === "in-progress").length,
      completed: filteredByDate.filter(r => r.status === "completed").length,
      escalated: filteredByDate.filter(r => r.status === "escalated" || (r.status === "completed" && r.was_escalated)).length,
      avgResponseTime: filteredByDate.length > 0 ? "18 minutes" : "N/A",
      avgResolutionTime: filteredByDate.length > 0 ? "45 minutes" : "N/A",
    };
    
    setStats(statData);
  };

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
      // Check if request was escalated before marking it complete
      const requestToUpdate = requests.find(r => r.id === id);
      const was_escalated = requestToUpdate?.status === "escalated" || requestToUpdate?.was_escalated;
      
      // Update with was_escalated flag if needed
      const updateData: any = { status };
      if (was_escalated) {
        updateData.was_escalated = true;
      }
      
      const { error: updateError } = await supabase
        .from('wifi_requests')
        .update(updateData)
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      if (comment) {
        const { error: commentError } = await supabase
          .from('request_comments')
          .insert([{
            request_id: id,
            user_name: userProfile?.first_name || "IT Staff",
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
              was_escalated: was_escalated
            };
            
            if (comment) {
              const comments = updatedRequest.comments || [];
              updatedRequest.comments = [
                ...comments,
                {
                  text: comment,
                  timestamp: new Date(),
                  user: userProfile?.first_name || "IT Staff",
                },
              ];
            }
            
            return updatedRequest;
          }
          return request;
        })
      );
      
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
        .update({ 
          status: 'escalated',
          was_escalated: true
        })
        .eq('id', id);
      
      if (error) {
        toast.error("Failed to escalate request");
        console.error("Error escalating request:", error);
        return;
      }
      
      setRequests(prev => 
        prev.map(req => 
          req.id === id ? { ...req, status: 'escalated', was_escalated: true } : req
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
      fetchRequests();
    } catch (error) {
      console.error("Error in escalation process:", error);
      toast.error("An error occurred during escalation");
    }
  };

  const onDateRangeChange = (range: DateRange | undefined) => {
    setDate(range);
    if (requests.length > 0) {
      calculateStats(requests);
    }
  };

  const handleManualCheckEscalation = async () => {
    try {
      setIsLoading(true);
      toast.info("Checking for requests to escalate...");
      
      const { data, error } = await supabase.functions.invoke('escalate-requests');
      
      if (error) {
        throw error;
      }
      
      console.log("Escalation check response:", data);
      
      if (data.success) {
        if (data.message.includes("Escalated")) {
          toast.success(data.message);
        } else {
          toast.info(data.message);
        }
      } else {
        toast.error("Failed to check escalations");
      }
      
      fetchRequests();
    } catch (error: any) {
      console.error("Error checking escalations:", error);
      toast.error("Failed to check escalations", {
        description: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Stats stats={stats} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <DatePickerWithRange 
          date={date} 
          setDate={onDateRangeChange} 
          className="w-full sm:w-auto"
        />
        
        <Button onClick={handleManualCheckEscalation} disabled={isLoading}>
          {isLoading ? "Processing..." : "Check for Escalations"}
        </Button>
      </div>
      
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
                        There are no WiFi assistance requests with this status in the selected date range.
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
        onEscalate={handleEscalateRequest}
      />
    </div>
  );
}
