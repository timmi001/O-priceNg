import { Link, useLocation } from "wouter";
import { Home, Search, PlusSquare, User, Bell, Mail } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16" />
      <nav className="fixed bottom-0 w-full bg-background/90 backdrop-blur-md border-t border-border flex justify-around p-3 z-50 safe-area-bottom pb-4">
        <Link href="/" className={`flex flex-col items-center gap-1 ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Home className="w-6 h-6" strokeWidth={location === '/' ? 2.5 : 2} />
        </Link>
        <Link href="/explore" className={`flex flex-col items-center gap-1 ${location === '/explore' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Search className="w-6 h-6" strokeWidth={location === '/explore' ? 2.5 : 2} />
        </Link>
        
        {/* Floating FAB for Sell */}
        <Link href="/sell" className="relative -top-5 bg-primary text-primary-foreground p-3 rounded-full shadow-lg shadow-primary/20 flex items-center justify-center">
          <PlusSquare className="w-6 h-6" strokeWidth={2.5} />
        </Link>

        <Link href="/notifications" className={`flex flex-col items-center gap-1 ${location === '/notifications' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Bell className="w-6 h-6" strokeWidth={location === '/notifications' ? 2.5 : 2} />
        </Link>
        <Link href="/profile" className={`flex flex-col items-center gap-1 ${location === '/profile' ? 'text-primary' : 'text-muted-foreground'}`}>
          <User className="w-6 h-6" strokeWidth={location === '/profile' ? 2.5 : 2} />
        </Link>
      </nav>
    </>
  );
}
