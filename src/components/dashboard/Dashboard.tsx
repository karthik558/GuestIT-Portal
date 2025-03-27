
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestsTab } from "./RequestsTab";
import { ReportGenerator } from "./ReportGenerator";
import { AdminUsers } from "./AdminUsers";
import { EscalationSettings } from "./EscalationSettings";
import { Stats } from "./Stats";
import { DatePickerWithRange } from "../ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { UserProfile } from "@/types/user";
import { useWifiRequests } from "@/hooks/use-wifi-requests";
import { useNotifications } from "@/hooks/use-notifications";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardProps {
  userProfile: UserProfile | null;
}

export function Dashboard({ userProfile }: DashboardProps) {
  const [activeDashboardTab, setActiveDashboardTab] = useState("requests");
  const { permission, requestPermission, showNotification } = useNotifications();
  const isMobile = useIsMobile();
  
  const {
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
  } = useWifiRequests();

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

  const onDateRangeChange = (range: DateRange | undefined) => {
    setDate(range);
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
        <TabsList className={`w-full ${isMobile ? "grid grid-cols-2 md:grid-cols-4 gap-1" : ""}`}>
          <TabsTrigger value="requests" className="min-w-0 px-2 flex-1">WiFi Requests</TabsTrigger>
          {userProfile?.role === 'admin' && (
            <TabsTrigger value="users" className="min-w-0 px-2 flex-1">User Management</TabsTrigger>
          )}
          <TabsTrigger value="reports" className="min-w-0 px-2 flex-1">Reports</TabsTrigger>
          {userProfile?.role === 'admin' && (
            <TabsTrigger value="settings" className="min-w-0 px-2 flex-1">Settings</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="requests" className="m-0 space-y-4">
          <RequestsTab 
            stats={stats}
            userProfile={userProfile}
            isLoading={isLoading}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            filteredRequests={filteredRequests}
            selectedRequest={selectedRequest}
            isDetailsOpen={isDetailsOpen}
            fetchRequests={fetchRequests}
            handleViewDetails={handleViewDetails}
            handleUpdateStatus={handleUpdateStatus}
            handleEscalateRequest={handleEscalateRequest}
            setIsDetailsOpen={setIsDetailsOpen}
          />
        </TabsContent>
        
        {userProfile?.role === 'admin' && (
          <TabsContent value="users" className="m-0 space-y-4">
            <AdminUsers />
          </TabsContent>
        )}
        
        <TabsContent value="reports" className="m-0 space-y-4">
          <ReportGenerator />
        </TabsContent>
        
        {userProfile?.role === 'admin' && (
          <TabsContent value="settings" className="m-0 space-y-4">
            <EscalationSettings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
