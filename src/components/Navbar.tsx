
import { useState, useEffect, useRef } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const navbarRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkAuth();
    
    // Set up auth state change listener to ensure login state is always current
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );
    
    // Add scroll listener to handle navbar compacting
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', handleScroll);
    };
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
    <header 
      ref={navbarRef}
      className={`border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50 transition-all duration-200 ${
        isScrolled ? "h-14" : "h-16"
      }`}
    >
      <div className="w-full max-w-full mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between h-full">
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/favicon.png" alt="Logo" className={`transition-all duration-200 ${isScrolled ? "h-7 w-7" : "h-8 w-8"}`} />
            <span className={`font-bold hidden sm:inline-block transition-all duration-200 ${isScrolled ? "text-lg" : "text-xl"}`}>
              WiFi Support
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4">
          <CustomModeToggle />
          
          {isAdmin && isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Admin</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <LayoutDashboard className="h-4 w-4 mr-2 flex-shrink-0" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              {pathname !== "/admin" && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                  <LayoutDashboard className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="whitespace-nowrap">Dashboard</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="whitespace-nowrap">Logout</span>
              </Button>
            </div>
          ) : pathname !== "/login" && (
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>
              <LogIn className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
