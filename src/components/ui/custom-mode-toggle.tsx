
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { ThemeContext } from "@/App";
import { Moon, Sun } from "lucide-react";

export function CustomModeToggle() {
  const { toggleTheme } = useContext(ThemeContext);
  
  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
