
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

type RequestStatus = "pending" | "in-progress" | "completed" | "escalated";

interface WifiRequest {
  id: string;
  name: string;
  roomNumber: string;
  deviceType: string;
  issueType: string;
  status: RequestStatus;
  createdAt: Date;
}

interface WifiRequestCardProps {
  request: WifiRequest;
  onClick?: () => void;
}

export function WifiRequestCard({ request, onClick }: WifiRequestCardProps) {
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

  const timeAgo = formatDistanceToNow(new Date(request.createdAt), { addSuffix: true });

  return (
    <Card className="card-hover overflow-hidden animate-scale-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{request.name}</CardTitle>
          <Badge variant="outline" className={`${getStatusColor(request.status)} text-white`}>
            {getStatusText(request.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Room:</p>
            <p className="font-medium">{request.roomNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Device:</p>
            <p className="font-medium capitalize">{request.deviceType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Issue:</p>
            <p className="font-medium capitalize">{request.issueType}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Submitted:</p>
            <p className="font-medium">{timeAgo}</p>
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
