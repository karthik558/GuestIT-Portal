
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserRole } from "@/types/user";

interface NavbarProps {
  isAdmin?: boolean;
}

export function Navbar({ isAdmin }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        setIsAuthenticated(true);
        const email = data.session.user.email;
        if (email) {
          setUserName(email.split('@')[0]);
        }
        
        // Get user role from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setUserRole('user');
        } else {
          setUserRole(profileData.role as UserRole);
        }
      } else {
        setIsAuthenticated(false);
        setUserRole(null);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        const email = session.user.email;
        if (email) {
          setUserName(email.split('@')[0]);
        }
        
        // Get user role from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          setUserRole('user');
        } else {
          setUserRole(profileData.role as UserRole);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserRole(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out", {
        description: error.message,
      });
    } else {
      toast.success("Signed out successfully");
      navigate("/login");
    }
  };

  const user = isAuthenticated
    ? { name: userName || "User", image: "", initials: (userName?.[0] || "U").toUpperCase() } 
    : null;
    
  const isAdminUser = userRole === 'admin';

  if (isLoading) {
    // Return a minimal navbar while loading
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full animate-slide-down">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <span className="h-8 w-8 rounded-full violet-gradient flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">L</span>
                </span>
                <span className="text-xl font-display font-semibold tracking-tight">
                  Lilac WiFi Support
                </span>
              </Link>
            </div>
            <ModeToggle />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full animate-slide-down">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="h-8 w-8 rounded-full violet-gradient flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </span>
              <span className="text-xl font-display font-semibold tracking-tight">
                Lilac WiFi Support
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <Link to="/" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
              Home
            </Link>
            {isAuthenticated && isAdminUser && (
              <Link to="/admin" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-accent">
                Dashboard
              </Link>
            )}
            <ModeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">{user.initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {userRole === 'admin' ? 'Administrator' : 'User'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {isAdminUser && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <ModeToggle />
            <Button
              variant="ghost"
              className="ml-2"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-slide-in">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              to="/"
              className="block px-3 py-2 text-base font-medium rounded-md hover:bg-accent"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {isAuthenticated && isAdminUser && (
              <Link
                to="/admin"
                className="block px-3 py-2 text-base font-medium rounded-md hover:bg-accent"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {!user ? (
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full mt-2">Login</Button>
              </Link>
            ) : (
              <Button
                variant="ghost"
                className="w-full mt-2 justify-start"
                onClick={() => {
                  handleSignOut();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
