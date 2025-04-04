
import { useState, useEffect, createContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider, ThemeContext } from "@/components/ui/theme-provider";
import { useTheme as useHookTheme } from "@/hooks/use-theme";

function App() {
  const { theme, toggleTheme } = useHookTheme();
  
  // Handle route detection for vercel or other hosting platforms
  useEffect(() => {
    // This will help with route refreshes in production
    const handleRouteRefresh = () => {
      const path = window.location.pathname;
      const isKnownRoute = ["/", "/login", "/admin"].includes(path);
      
      if (!isKnownRoute && !path.includes('.')) {
        console.log('Detected unknown route on refresh, handling SPA pathing:', path);
      }
    };
    
    handleRouteRefresh();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/404" element={<NotFound />} />
            {/* Redirect all unknown routes to 404 */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
          
          <Toaster />
          <SonnerToaster richColors position="top-right" />
        </BrowserRouter>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
