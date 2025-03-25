
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { useTheme } from "./hooks/use-theme";
import { createContext } from "react";
import { NotificationProvider } from "./contexts/NotificationContext";

export type ThemeContextType = {
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextType>({ toggleTheme: () => {} });

const queryClient = new QueryClient();

function App() {
  const { toggleTheme } = useTheme();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ toggleTheme }}>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
