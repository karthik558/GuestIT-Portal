import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { WifiRequest, RequestStatus } from "@/types/wifi-request";

interface RequestDetailsProps {
  request: (WifiRequest | {
    id: string;
    name: string;
    email: string;
    room_number?: string;
    roomNumber?: string;
    device_type?: string;
    deviceType?: string;
    issue_type?: string;
    issueType?: string;
    description: string;
    status: RequestStatus;
    created_at: Date;
    comments?: { text: string; timestamp: Date; user: string }[];
  }) | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onUpdateStatus?: (id: string, status: RequestStatus, comment?: string) => void;
  onEscalate?: (id: string) => Promise<void>;
}

export function RequestDetails({ 
  request, 
  isOpen, 
  onClose, 
  isAdmin = false,
  onUpdateStatus,
  onEscalate
}: RequestDetailsProps) {
  const [comment, setComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!request) return null;
  
  const roomNumber = request.room_number || (request as any).roomNumber || "";
  const deviceType = request.device_type || (request as any).deviceType || "";
  const issueType = request.issue_type || (request as any).issueType || "";
  
  const timeAgo = formatDistanceToNow(new Date(request.created_at), { addSuffix: true });
  const formattedDate = format(new Date(request.created_at), "PPpp");

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "in-progress":
        return "bg-blue-500 hover:bg-blue-600";
      case "completed":
        return "bg-green-500 hover:bg-green-600";
      case "escalated":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusText = (status: RequestStatus) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "escalated":
        return "Escalated";
      default:
        return "Unknown";
    }
  };

  const handleUpdateStatus = async (status: RequestStatus) => {
    setIsUpdating(true);
    
    try {
      if (onUpdateStatus) {
        await onUpdateStatus(request.id, status, comment);
      }
      
      toast.success(`Request status updated to ${getStatusText(status)}`, {
        description: comment ? "Comment added successfully" : "",
      });
      
      setComment("");
      onClose();
    } catch (error: any) {
      toast.error("Failed to update status", {
        description: error.message || "Please try again",
      });
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEscalate = async () => {
    setIsUpdating(true);
    
    try {
      if (onEscalate) {
        await onEscalate(request.id);
      }
      
      toast.success("Request has been escalated", {
        description: "Notification emails will be sent to IT managers",
      });
      
      setComment("");
      onClose();
    } catch (error: any) {
      toast.error("Failed to escalate request", {
        description: error.message || "Please try again",
      });
      console.error("Error escalating request:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Request Details</span>
            <Badge variant="outline" className={`${getStatusColor(request.status)} text-white`}>
              {getStatusText(request.status)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Submitted {timeAgo}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Guest</p>
              <p>{request.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{request.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Room</p>
              <p>{roomNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p>{formattedDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Device Type</p>
              <p className="capitalize">{deviceType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Issue Type</p>
              <p className="capitalize">{issueType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tracking ID</p>
              <p className="font-mono text-sm">{request.id}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="p-3 bg-accent rounded-md text-sm mt-1">{request.description || "No description provided."}</p>
          </div>
          
          {request.comments && request.comments.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Comments</p>
              <div className="space-y-2 mt-1">
                {request.comments.map((comment, index) => (
                  <div key={index} className="p-3 bg-accent rounded-md text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{comment.user}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.timestamp), "Pp")}
                      </span>
                    </div>
                    <p className="mt-1">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {isAdmin && (
            <>
              <Separator />
              
              <div>
                <p className="text-sm font-medium mb-2">Add Comment</p>
                <Textarea
                  placeholder="Enter comment or resolution details..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          {isAdmin && request.status !== "completed" && (
            <>
              {request.status === "pending" && (
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus("in-progress")}
                  disabled={isUpdating}
                >
                  Mark In Progress
                </Button>
              )}
              
              <Button
                onClick={() => handleUpdateStatus("completed")}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                Mark Complete
              </Button>
              
              {request.status !== "escalated" && (
                <Button
                  variant="destructive"
                  onClick={handleEscalate}
                  disabled={isUpdating}
                >
                  Escalate
                </Button>
              )}
            </>
          )}
          
          {!isAdmin && (
            <Button onClick={onClose}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
