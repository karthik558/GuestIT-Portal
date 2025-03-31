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
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Initialize notification sound and service worker on mount (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Create audio element for notification sound
    if (typeof Audio !== "undefined") {
      const audio = new Audio("/notification-sound.mp3");
      audio.preload = "auto";
      setNotificationAudio(audio);
    }
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          setSwRegistration(registration);
          setPermission(Notification.permission);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    } else {
      console.log("Service workers are not supported");
    }
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    if (!('serviceWorker' in navigator)) {
      console.log("Service workers are not supported");
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
  const showNotification = async ({ title, body, icon = "/favicon.png", sound = true }: NotificationOptions) => {
    if (!swRegistration) {
      console.log("Service Worker is not registered yet");
      return;
    }

    if (Notification.permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return;
    }

    try {
      await swRegistration.showNotification(title, {
        body,
        icon,
        silent: !sound,
        data: { sound: sound ? '/notification-sound.mp3' : undefined }
      });
      
      if (sound && notificationAudio) {
        await notificationAudio.play().catch(e => console.error("Error playing notification sound:", e));
      }
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  };

  return {
    permission,
    requestPermission,
    showNotification,
  };
}
