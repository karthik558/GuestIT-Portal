import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          © Copyright 2025. All rights reserved. Developed by{" "}
          <a 
            href="https://karthiklal.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            KARTHIK LAL
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
