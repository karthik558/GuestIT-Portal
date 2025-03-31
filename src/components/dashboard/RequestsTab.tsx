import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WifiRequestCard } from "../WifiRequestCard";
import { RequestDetails } from "../RequestDetails";
import { WifiRequest, RequestStatus } from "@/types/wifi-request";
import { UserProfile } from "@/types/user";
import { useIsMobile } from "@/hooks/use-mobile";

interface RequestsTabProps {
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    escalated: number;
    avgResponseTime: string;
    avgResolutionTime: string;
  };
  userProfile: UserProfile | null;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredRequests: WifiRequest[];
  selectedRequest: WifiRequest | null;
  isDetailsOpen: boolean;
  fetchRequests: () => void;
  handleViewDetails: (request: WifiRequest) => void;
  handleUpdateStatus: (id: string, status: RequestStatus, userProfile: UserProfile | null, comment?: string) => void;
  handleEscalateRequest: (id: string) => Promise<void>;
  setIsDetailsOpen: (isOpen: boolean) => void;
}

export function RequestsTab({
  stats,
  userProfile,
  isLoading,
  activeTab,
  setActiveTab,
  filteredRequests,
  selectedRequest,
  isDetailsOpen,
  fetchRequests,
  handleViewDetails,
  handleUpdateStatus,
  handleEscalateRequest,
  setIsDetailsOpen
}: RequestsTabProps) {
  const isMobile = useIsMobile();

  const onUpdateStatus = (id: string, status: RequestStatus, comment?: string) => {
    handleUpdateStatus(id, status, userProfile, comment);
  };

  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="w-full sm:w-auto">
          <div className="flex justify-start">
            <TabsList className={`${isMobile ? "grid grid-cols-3 gap-1" : "inline-flex"} sm:w-auto`}>
              <TabsTrigger value="all" className="rounded-md px-3 py-1.5">
                Active
              </TabsTrigger>
              <TabsTrigger value="pending" className="rounded-md px-3 py-1.5">
                Pending
              </TabsTrigger>
              <TabsTrigger value="in-progress" className="rounded-md px-3 py-1.5">
                In Progress
              </TabsTrigger>
              {!isMobile && (
                <>
                  <TabsTrigger value="completed" className="rounded-md px-3 py-1.5">
                    Completed
                  </TabsTrigger>
                  <TabsTrigger value="escalated" className="rounded-md px-3 py-1.5">
                    Escalated
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>
        </div>
        
        {isMobile && (
          <div className="w-full">
            <div className="flex justify-start">
              <TabsList className="grid grid-cols-2 gap-1 w-full">
                <TabsTrigger value="completed" className="rounded-md px-3 py-1.5">
                  Completed
                </TabsTrigger>
                <TabsTrigger value="escalated" className="rounded-md px-3 py-1.5">
                  Escalated
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          onClick={fetchRequests} 
          className="w-full sm:w-auto mt-2 sm:mt-0"
        >
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
                  There are no WiFi assistance requests with this status in the selected date range.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <RequestDetails
        request={selectedRequest}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        isAdmin={userProfile?.role === 'admin'}
        onUpdateStatus={onUpdateStatus}
        onEscalate={handleEscalateRequest}
      />
    </Tabs>
  );
}
