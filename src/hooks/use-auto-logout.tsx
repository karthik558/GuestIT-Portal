
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseAutoLogoutProps {
  isAuthenticated: boolean;
  inactivityTime?: number; // in milliseconds
}

export function useAutoLogout({ isAuthenticated, inactivityTime = 7200000 }: UseAutoLogoutProps) {
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [warningShown, setWarningShown] = useState<boolean>(false);
  
  // Update last activity timestamp on user interaction
  useEffect(() => {
    if (!isAuthenticated) return;

    const updateActivity = () => {
      setLastActivity(Date.now());
      setWarningShown(false);
    };
    
    // Update on various user interactions
    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("mousedown", updateActivity);
    window.addEventListener("touchstart", updateActivity);
    
    // Initial activity timestamp
    updateActivity();
    
    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("mousedown", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
    };
  }, [isAuthenticated]);
  
  // Check for inactivity
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const warningTime = inactivityTime - (5 * 60 * 1000); // 5 minutes before logout
    
    const interval = setInterval(() => {
      const now = Date.now();
      const inactive = now - lastActivity;
      
      // Show warning 5 minutes before logout
      if (inactive >= warningTime && !warningShown) {
        toast.warning("Session expiring soon", {
          description: "You'll be logged out in 5 minutes due to inactivity.",
          duration: 10000,
        });
        setWarningShown(true);
      }
      
      // Log out after specified inactivity time
      if (inactive >= inactivityTime) {
        clearInterval(interval);
        handleLogout();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity, inactivityTime, warningShown]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.info("Logged out due to inactivity", {
        description: "Please log in again to continue."
      });
      
      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  
  return null;
}
