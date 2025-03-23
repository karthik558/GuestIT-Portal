
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
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/admin");
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
      
      console.log("Auth response:", { data, error });
      
      if (error) throw error;
      
      // Check if the user has admin role
      let userRole: UserRole = 'user';
      
      // Get user role from metadata or determine it (e.g., could be based on email domain)
      if (data.user?.user_metadata?.role === 'admin') {
        userRole = 'admin';
      } else {
        // Set role based on email for demonstration
        // In a real app, you'd check against your database
        const adminEmails = ['admin@lilac.com', 'admin@example.com'];
        if (adminEmails.includes(data.user?.email || '')) {
          // Update the user metadata to include role
          const { error: updateError } = await supabase.auth.updateUser({
            data: { role: 'admin' }
          });
          
          if (!updateError) {
            userRole = 'admin';
          }
        }
      }
      
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
