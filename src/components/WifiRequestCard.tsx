import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { WifiRequest, RequestStatus } from "@/types/wifi-request";
import { Copy } from "lucide-react";
import { toast } from "sonner";

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
  // Handle both property naming conventions (Supabase uses snake_case, frontend uses camelCase)
  const roomNumber = request.room_number || ('roomNumber' in request ? request.roomNumber : "") || "";
  const deviceType = request.device_type || ('deviceType' in request ? request.deviceType : "") || "";
  const issueType = request.issue_type || ('issueType' in request ? request.issueType : "") || "";

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

  const handleCopyId = () => {
    navigator.clipboard.writeText(request.id);
    toast.success("Tracking ID copied to clipboard");
  };

  return (
    <Card className="card-hover overflow-hidden animate-scale-in animate-fade-in animate-slide-in">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <CardTitle className="text-lg line-clamp-1">{request.name}</CardTitle>
          <Badge variant="outline" className={`${getStatusColor(request.status, request.was_escalated)} text-white`}>
            {getStatusText(request.status, request.was_escalated)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Room:</p>
              <p className="font-medium line-clamp-1">{roomNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Device:</p>
              <p className="font-medium capitalize line-clamp-1">{deviceType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Issue:</p>
              <p className="font-medium capitalize line-clamp-1">{issueType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Submitted:</p>
              <p className="font-medium line-clamp-1">{timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-background/95 backdrop-blur-sm border border-border/50 rounded-md card-hover">
            <div className="flex-1 text-left">
              <p className="text-muted-foreground text-xs">Tracking ID:</p>
              <p className="font-mono text-xs line-clamp-1">{request.id}</p>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 shrink-0"
              onClick={handleCopyId}
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
          onClick={onClick} 
          className="w-full"
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
