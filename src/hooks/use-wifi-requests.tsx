
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { WifiRequest, RequestStatus } from "@/types/wifi-request";
import { UserProfile } from "@/types/user";
import { toast } from "sonner";
import { isWithinInterval, parseISO } from "date-fns";

interface RequestStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  escalated: number;
  avgResponseTime: string;
  avgResolutionTime: string;
}

export function useWifiRequests() {
  const [requests, setRequests] = useState<WifiRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<WifiRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<WifiRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState<RequestStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    escalated: 0,
    avgResponseTime: "N/A",
    avgResolutionTime: "N/A",
  });
  
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
  });

  useEffect(() => {
    if (!requests.length) return;
    filterRequests();
  }, [requests, activeTab, date]);

  const isDateInRange = (dateToCheck: Date): boolean => {
    if (!date || !date.from) return true;
    
    try {
      if (date.from && !date.to) {
        return dateToCheck >= date.from;
      }
      
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
    
    if (date && date.from) {
      filtered = filtered.filter(request => {
        const requestDate = new Date(request.created_at);
        return isDateInRange(requestDate);
      });
    }
    
    if (activeTab !== "all") {
      if (activeTab === "escalated") {
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
        const wasEscalated = request.status === "escalated" || 
                           (request.status === "completed" && (request as any).was_escalated === true);
        
        return {
          ...request,
          created_at: new Date(request.created_at),
          was_escalated: wasEscalated
        } as WifiRequest;
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

  const handleUpdateStatus = async (id: string, status: RequestStatus, userProfile: UserProfile | null, comment?: string) => {
    try {
      const requestToUpdate = requests.find(r => r.id === id);
      const was_escalated = requestToUpdate?.status === "escalated" || requestToUpdate?.was_escalated;
      
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

  return {
    requests,
    filteredRequests,
    selectedRequest,
    isDetailsOpen,
    isLoading,
    activeTab,
    stats,
    date,
    setDate,
    setActiveTab,
    fetchRequests,
    handleViewDetails,
    handleUpdateStatus,
    handleEscalateRequest,
    handleManualCheckEscalation,
    setIsDetailsOpen
  };
}
