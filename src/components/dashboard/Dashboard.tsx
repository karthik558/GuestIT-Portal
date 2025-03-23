
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportGenerator } from "./ReportGenerator";
import { Stats } from "./Stats";
import { WifiRequestCard } from "../WifiRequestCard";
import { RequestDetails } from "../RequestDetails";

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

// Sample data
const MOCK_REQUESTS: WifiRequest[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    roomNumber: "101",
    deviceType: "laptop",
    issueType: "connect",
    description: "I can't connect to the WiFi network. My laptop doesn't show the hotel's network in the list.",
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    roomNumber: "203",
    deviceType: "smartphone",
    issueType: "slow",
    description: "The WiFi is extremely slow. I can't even load basic web pages.",
    status: "in-progress",
    createdAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago
    comments: [
      {
        text: "Checking the network in your area. Will send someone shortly.",
        timestamp: new Date(Date.now() - 20 * 60000),
        user: "IT Staff",
      },
    ],
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert.j@example.com",
    roomNumber: "305",
    deviceType: "tablet",
    issueType: "disconnect",
    description: "WiFi keeps disconnecting every few minutes. Very frustrating.",
    status: "escalated",
    createdAt: new Date(Date.now() - 120 * 60000), // 2 hours ago
    comments: [
      {
        text: "Initial troubleshooting didn't resolve the issue. Escalating to network team.",
        timestamp: new Date(Date.now() - 90 * 60000),
        user: "IT Staff",
      },
    ],
  },
  {
    id: "4",
    name: "Mary Williams",
    email: "mary.w@example.com",
    roomNumber: "402",
    deviceType: "laptop",
    issueType: "login",
    description: "I can connect to WiFi but the login page doesn't load.",
    status: "completed",
    createdAt: new Date(Date.now() - 240 * 60000), // 4 hours ago
    comments: [
      {
        text: "Reset captive portal for the room. Please try again.",
        timestamp: new Date(Date.now() - 220 * 60000),
        user: "IT Staff",
      },
      {
        text: "Issue resolved. Guest confirmed WiFi is working now.",
        timestamp: new Date(Date.now() - 180 * 60000),
        user: "IT Staff",
      },
    ],
  },
];

const STATS = {
  total: MOCK_REQUESTS.length,
  pending: MOCK_REQUESTS.filter(r => r.status === "pending").length,
  inProgress: MOCK_REQUESTS.filter(r => r.status === "in-progress").length,
  completed: MOCK_REQUESTS.filter(r => r.status === "completed").length,
  escalated: MOCK_REQUESTS.filter(r => r.status === "escalated").length,
  avgResponseTime: "18 minutes",
  avgResolutionTime: "45 minutes",
};

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [requests, setRequests] = useState<WifiRequest[]>(MOCK_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<WifiRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredRequests = activeTab === "all" 
    ? requests 
    : requests.filter(request => {
        if (activeTab === "pending") return request.status === "pending";
        if (activeTab === "in-progress") return request.status === "in-progress";
        if (activeTab === "completed") return request.status === "completed";
        if (activeTab === "escalated") return request.status === "escalated";
        return true;
      });

  const handleViewDetails = (request: WifiRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = (id: string, status: RequestStatus, comment?: string) => {
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
  };

  return (
    <div className="space-y-6">
      <Stats stats={STATS} />
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="escalated">Escalated</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" onClick={() => setActiveTab("all")}>
            Refresh
          </Button>
        </div>
        
        <TabsContent value={activeTab} className="m-0">
          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequests.map((request) => (
                <WifiRequestCard
                  key={request.id}
                  request={request}
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
