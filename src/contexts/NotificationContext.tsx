
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type NotificationContextType = {
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextType>({
  hasPermission: false,
  requestPermission: async () => false,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Check if the browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    // Check if permission was already granted
    if (Notification.permission === "granted") {
      setHasPermission(true);
    }

    // Subscribe to realtime changes on the wifi_requests table
    const subscribeToRequests = async () => {
      const { data: authData } = await supabase.auth.getSession();
      
      // Only subscribe if user is authenticated (admin)
      if (authData.session) {
        const channel = supabase
          .channel('public:wifi_requests')
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'wifi_requests' 
          }, (payload) => {
            // Show notification if permission granted
            if (Notification.permission === "granted") {
              // Play sound
              const audio = new Audio('/notification-sound.mp3');
              audio.play();

              // Show notification
              const notification = new Notification('New WiFi Support Request', {
                body: `New request from ${payload.new.name} in room ${payload.new.room_number}`,
                icon: '/favicon.png'
              });

              // Open dashboard when notification is clicked
              notification.onclick = () => {
                window.focus();
                window.location.href = '/admin';
              };
            }

            // Show toast regardless of notification permission
            toast.info('New Support Request', {
              description: `From ${payload.new.name} in room ${payload.new.room_number}`
            });
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    if (hasPermission) {
      subscribeToRequests();
    }
  }, [hasPermission]);

  const requestPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      toast.error("Notifications are not supported in this browser");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";
      setHasPermission(granted);
      
      if (granted) {
        toast.success("Notification permission granted");
      } else {
        toast.error("Notification permission denied");
      }
      
      return granted;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Failed to request notification permission");
      return false;
    }
  };

  return (
    <NotificationContext.Provider value={{ hasPermission, requestPermission }}>
      {children}
    </NotificationContext.Provider>
  );
};
