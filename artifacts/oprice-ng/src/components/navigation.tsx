import { Link, useLocation } from "wouter";
import { Home, Search, Plus, Bell, User, Store } from "lucide-react";

interface BottomNavProps {
  hidden?: boolean;
}

export function BottomNav({ hidden = false }: BottomNavProps) {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Spacer */}
      <div className="h-20" />

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out will-change-transform"
        style={{ transform: hidden ? "translateY(100%)" : "translateY(0)" }}
      >
        <div className="bg-[#0d0d0d]/95 backdrop-blur-xl border-t border-white/6 flex items-center justify-around px-2 pt-3 pb-5 safe-area-bottom">

          <Link href="/" className="flex flex-col items-center gap-1" data-testid="nav-home">
            <div className={`p-2 rounded-2xl transition-colors ${isActive("/") ? "bg-primary/15" : "hover:bg-white/5"}`}>
              <Home
                className={`w-6 h-6 transition-colors ${isActive("/") ? "text-primary" : "text-white/40"}`}
                strokeWidth={isActive("/") ? 2.5 : 1.8}
              />
            </div>
          </Link>

          <Link href="/explore" className="flex flex-col items-center gap-1" data-testid="nav-market">
            <div className={`p-2 rounded-2xl transition-colors ${isActive("/explore") ? "bg-primary/15" : "hover:bg-white/5"}`}>
              <Store
                className={`w-6 h-6 transition-colors ${isActive("/explore") ? "text-primary" : "text-white/40"}`}
                strokeWidth={isActive("/explore") ? 2.5 : 1.8}
              />
            </div>
          </Link>

          {/* Floating center create button */}
          <Link href="/sell" data-testid="nav-sell">
            <div className="relative -top-4 bg-primary text-primary-foreground w-14 h-14 rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:shadow-primary/60 transition-all hover:scale-105 active:scale-95">
              <Plus className="w-7 h-7" strokeWidth={2.5} />
            </div>
          </Link>

          <Link href="/notifications" className="flex flex-col items-center gap-1" data-testid="nav-notifications">
            <div className={`relative p-2 rounded-2xl transition-colors ${isActive("/notifications") ? "bg-primary/15" : "hover:bg-white/5"}`}>
              <Bell
                className={`w-6 h-6 transition-colors ${isActive("/notifications") ? "text-primary" : "text-white/40"}`}
                strokeWidth={isActive("/notifications") ? 2.5 : 1.8}
              />
              {/* Notification dot */}
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0d0d0d]" />
            </div>
          </Link>

          <Link href="/profile" className="flex flex-col items-center gap-1" data-testid="nav-profile">
            <div className={`p-2 rounded-2xl transition-colors ${isActive("/profile") ? "bg-primary/15" : "hover:bg-white/5"}`}>
              <User
                className={`w-6 h-6 transition-colors ${isActive("/profile") ? "text-primary" : "text-white/40"}`}
                strokeWidth={isActive("/profile") ? 2.5 : 1.8}
              />
            </div>
          </Link>

        </div>
      </nav>
    </>
  );
}
