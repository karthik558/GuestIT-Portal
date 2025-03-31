import { createContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type NotificationContextType = {
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
};

export const NotificationContext = createContext<NotificationContextType>({
  hasPermission: false,
  requestPermission: async () => false,
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if the browser supports service workers and notifications
    if (!("serviceWorker" in navigator)) {
      console.log("This browser does not support service workers");
      return;
    }

    // Register service worker
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        setSwRegistration(registration);
        if (Notification.permission === "granted") {
          setHasPermission(true);
        }
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  }, []);

  useEffect(() => {
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
          }, async (payload) => {
            // Show notification if permission granted and service worker is registered
            if (hasPermission && swRegistration) {
              try {
                await swRegistration.showNotification('New WiFi Support Request', {
                  body: `New request from ${payload.new.name} in room ${payload.new.room_number}`,
                  icon: '/favicon.png',
                  silent: false,
                  data: { sound: '/notification-sound.mp3' }
                });

                const audio = new Audio('/notification-sound.mp3');
                await audio.play().catch(e => console.error("Error playing notification sound:", e));
              } catch (error) {
                console.error("Error showing notification:", error);
              }
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

    if (hasPermission && swRegistration) {
      subscribeToRequests();
    }
  }, [hasPermission, swRegistration]);

  const requestPermission = async (): Promise<boolean> => {
    if (!("serviceWorker" in navigator)) {
      toast.error("Service workers are not supported in this browser");
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
