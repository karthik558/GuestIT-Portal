
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AutoLogoutProps {
  inactivityTime?: number; // In milliseconds
  isAuthenticated: boolean;
}

export function useAutoLogout({ inactivityTime = 3600000, isAuthenticated }: AutoLogoutProps) {
  const navigate = useNavigate();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Reset timer on user activity
  const resetTimer = () => {
    setLastActivity(Date.now());
  };

  // Register activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click', 'keydown'
    ];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated]);

  // Check for inactivity
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > inactivityTime) {
        setIsChecking(true);
        handleLogout();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [lastActivity, inactivityTime, isAuthenticated]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.info("You've been logged out due to inactivity");
      navigate("/login");
    } catch (error) {
      console.error("Error during auto-logout:", error);
    } finally {
      setIsChecking(false);
    }
  };

  return { isChecking };
}
