
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/types/user";
import { UserProfile } from "@/types/user";
import { useAutoLogout } from "@/hooks/use-auto-logout";

export default function Admin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Use auto-logout hook
  useAutoLogout({ isAuthenticated, inactivityTime: 3600000 }); // 1 hour
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth error:", error);
          toast.error("Authentication error");
          navigate("/login");
          return;
        }
        
        if (!data.session) {
          toast.error("You must be logged in to access this page");
          navigate("/login");
          return;
        }
        
        setIsAuthenticated(true);
        
        // Check user role from profiles table
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
          
          if (profileError) {
            console.error("Profile error:", profileError);
            toast.error("Failed to fetch user profile");
            navigate("/login");
            return;
          }
          
          const role = profileData.role as UserRole;
          setUserRole(role);
          
          // Create user profile object
          const profile: UserProfile = {
            id: data.session.user.id,
            email: data.session.user.email || '',
            role: role,
            created_at: data.session.user.created_at,
            last_sign_in_at: data.session.user.last_sign_in_at,
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            team: profileData.team || '',
            can_escalate: profileData.can_escalate || false
          };
          
          setUserProfile(profile);
          
          if (role !== 'admin') {
            toast.error("You don't have permission to access the admin dashboard");
            navigate("/");
            return;
          }
          
          setIsLoading(false);
        } catch (profileErr) {
          console.error("Profile fetch error:", profileErr);
          toast.error("Failed to fetch user profile");
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("An unexpected error occurred");
        navigate("/login");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar isAdmin={true} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-lg">Loading dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isAdmin={true} />
      
      <main className="flex-1 page-container pb-16 animate-fade-in">
        <div className="space-y-4 max-w-7xl mx-auto">
          <div>
            <h1 className="heading-1">Admin Dashboard</h1>
            <p className="subtitle">
              Manage WiFi assistance requests and generate reports
            </p>
          </div>
          
          <Dashboard />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
