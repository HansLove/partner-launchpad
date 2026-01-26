import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <span className="text-xs font-bold text-primary-foreground">P</span>
            </div>
            <span className="text-sm font-medium">Partner Portal</span>
          </div>
          
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link to="#" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
            <Link to="#" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="#" className="transition-colors hover:text-foreground">
              Support
            </Link>
            <Link to="#" className="transition-colors hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
        
        <div className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Partner Portal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
