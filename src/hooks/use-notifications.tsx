
import { useState, useEffect } from "react";

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  sound?: boolean;
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | "default">("default");
  const [notificationAudio, setNotificationAudio] = useState<HTMLAudioElement | null>(null);

  // Initialize notification sound on mount (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Create audio element for notification sound
    if (typeof Audio !== "undefined") {
      const audio = new Audio("/notification-sound.mp3");
      audio.preload = "auto";
      setNotificationAudio(audio);
    }
    
    // Check notification permission on mount
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    setPermission(Notification.permission);
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return false;
    }

    if (Notification.permission === "granted") {
      setPermission("granted");
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  // Show notification
  const showNotification = ({ title, body, icon = "/favicon.png", sound = true }: NotificationOptions) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission !== "granted") {
      requestPermission().then(granted => {
        if (granted) {
          new Notification(title, { body, icon });
          if (sound && notificationAudio) {
            notificationAudio.play().catch(e => console.error("Error playing notification sound:", e));
          }
        }
      });
      return;
    }

    new Notification(title, { body, icon });
    if (sound && notificationAudio) {
      notificationAudio.play().catch(e => console.error("Error playing notification sound:", e));
    }
  };

  return {
    permission,
    requestPermission,
    showNotification,
  };
}
