
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Admin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth error:", error);
        toast.error("Authentication error");
      }
      
      if (!data.session) {
        toast.error("You must be logged in to access this page");
        navigate("/login");
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
          <p className="text-lg">Loading...</p>
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
