import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { WifiRequest, RequestStatus } from "@/types/wifi-request";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface WifiRequestCardProps {
  request: WifiRequest | {
    id: string;
    name: string;
    room_number?: string;
    roomNumber?: string;
    device_type?: string;
    deviceType?: string;
    issue_type?: string;
    issueType?: string;
    status: RequestStatus;
    created_at: Date;
    was_escalated?: boolean;
  };
  onClick?: () => void;
}

export function WifiRequestCard({ request, onClick }: WifiRequestCardProps) {
  // Handle both property naming conventions with proper typing
  const roomNumber = ('room_number' in request ? request.room_number : request.roomNumber) || "";
  const deviceType = ('device_type' in request ? request.device_type : request.deviceType) || "";
  const issueType = ('issue_type' in request ? request.issue_type : request.issueType) || "";

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(request.id);
    toast.success("Tracking ID copied to clipboard");
  };

  const getStatusColor = (status: RequestStatus, wasEscalated?: boolean) => {
    if (status === "completed" && wasEscalated) {
      return "bg-purple-500 hover:bg-purple-600";
    }
    
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

  const getStatusText = (status: RequestStatus, wasEscalated?: boolean) => {
    if (status === "completed" && wasEscalated) {
      return "Resolved (Escalated)";
    }
    
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

  const timeAgo = formatDistanceToNow(new Date(request.created_at), { addSuffix: true });

  return (
    <Card 
      className="relative overflow-hidden transition-all duration-200 hover:shadow-lg animate-scale-in group cursor-pointer"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      <CardHeader className="pb-2">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {request.name}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "transition-colors duration-200",
              getStatusColor(request.status, request.was_escalated),
              "text-white"
            )}
          >
            {getStatusText(request.status, request.was_escalated)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pb-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Room</p>
            <p className="font-medium line-clamp-1">{roomNumber}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Device</p>
            <p className="font-medium capitalize line-clamp-1">{deviceType}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Issue</p>
            <p className="font-medium capitalize line-clamp-1">{issueType}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Submitted</p>
            <p className="font-medium line-clamp-1">{timeAgo}</p>
          </div>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg border transition-colors duration-200 hover:bg-muted">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Tracking ID</p>
              <p className="font-mono text-sm font-medium truncate">{request.id}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCopyId}
              className="h-8 w-8 transition-transform hover:scale-105 active:scale-95"
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy tracking ID</span>
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation(); // Prevent double triggering
            onClick?.();
          }}
          className="w-full transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
