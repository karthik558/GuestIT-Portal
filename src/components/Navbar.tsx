
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CustomModeToggle } from "@/components/ui/custom-mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NavbarProps {
  isAdmin?: boolean;
}

export function Navbar({ isAdmin = false }: NavbarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkAuth();
  }, []);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };
  
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold hidden sm:inline-block">WiFi Support</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <CustomModeToggle />
          
          {isAdmin && isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  <span>Admin</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isLoggedIn ? (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          ) : pathname !== "/login" && (
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
              <LogIn className="h-4 w-4 mr-2" />
              Admin Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
