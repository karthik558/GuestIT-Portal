
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/user";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Get the user's profile to check their role
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.session.user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching profile:", profileError);
            // Still allow navigation but default to user role
            navigate("/");
            return;
          }
          
          // Redirect based on role
          if (profileData.role === 'admin') {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simple validation
      if (!formData.email || !formData.password) {
        toast.error("Please fill in all fields");
        setIsLoading(false);
        return;
      }
      
      console.log("Attempting login with:", formData.email);
      
      // Use Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      
      if (error) throw error;
      
      // Get user profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        toast.error("Failed to fetch user profile");
        setIsLoading(false);
        return;
      }
      
      const userRole = profileData.role as UserRole;
      
      toast.success(`Login successful. Welcome ${userRole === 'admin' ? 'Administrator' : 'User'}`);
      
      if (userRole === 'admin') {
        navigate("/admin");
      } else {
        navigate("/");
      }
      
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: error.message || "Invalid credentials",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-lg">Checking authentication...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 animate-scale-in">
          <div className="text-center">
            <h1 className="heading-1">Admin Login</h1>
            <p className="subtitle mt-2">
              Login to access the Lilac WiFi Support dashboard
            </p>
          </div>
          
          <div className="bg-card p-8 rounded-lg border shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="border-primary/20 focus-visible:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="border-primary/20 focus-visible:ring-primary"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a href="#" className="text-primary hover:text-primary/90">
                    Forgot password?
                  </a>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Sign in"}
              </Button>
              
              <div className="text-center text-xs text-muted-foreground">
                <p>Sign in with your Supabase user credentials</p>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
