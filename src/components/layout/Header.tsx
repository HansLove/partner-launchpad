import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">P</span>
          </div>
          <span className="text-lg font-semibold">Partner Portal</span>
        </Link>

        <nav className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log out</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Create account</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
