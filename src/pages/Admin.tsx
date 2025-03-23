
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/types/user";

export default function Admin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
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
      
      // Check user role from metadata
      const role = data.session.user.user_metadata?.role as UserRole || 'user';
      setUserRole(role);
      
      if (role !== 'admin') {
        toast.error("You don't have permission to access the admin dashboard");
        navigate("/");
        return;
      }
      
      setIsLoading(false);
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
