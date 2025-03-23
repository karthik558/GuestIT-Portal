
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

type RequestStatus = "pending" | "in-progress" | "completed" | "escalated";

interface WifiRequest {
  id: string;
  name: string;
  email: string;
  roomNumber: string;
  deviceType: string;
  issueType: string;
  description: string;
  status: RequestStatus;
  createdAt: Date;
  comments?: { text: string; timestamp: Date; user: string }[];
}

interface RequestDetailsProps {
  request: WifiRequest | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onUpdateStatus?: (id: string, status: RequestStatus, comment?: string) => void;
}

export function RequestDetails({ 
  request, 
  isOpen, 
  onClose, 
  isAdmin = false,
  onUpdateStatus 
}: RequestDetailsProps) {
  const [comment, setComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!request) return null;
  
  const timeAgo = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });
  const formattedDate = format(new Date(request.createdAt), "PPpp");

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

  const handleUpdateStatus = (status: RequestStatus) => {
    setIsUpdating(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      if (onUpdateStatus) {
        onUpdateStatus(request.id, status, comment);
      }
      
      toast.success(`Request status updated to ${getStatusText(status)}`, {
        description: comment ? "Comment added successfully" : "",
      });
      
      setComment("");
      setIsUpdating(false);
      onClose();
    }, 1000);
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
              <p>{request.roomNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p>{formattedDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Device Type</p>
              <p className="capitalize">{request.deviceType}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Issue Type</p>
              <p className="capitalize">{request.issueType}</p>
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
                  onClick={() => handleUpdateStatus("escalated")}
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
