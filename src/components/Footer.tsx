
import { ModeToggle } from "@/components/ui/mode-toggle";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © Copyright 2025. All rights reserved. Developed by KARTHIK LAL.
        </p>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </footer>
  );
}
