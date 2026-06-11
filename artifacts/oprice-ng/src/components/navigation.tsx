import { Link, useLocation } from "wouter";
import { Home, Plus, Bookmark, User, Store } from "lucide-react";

interface BottomNavProps {
  hidden?: boolean;
}

/*
  SVG notch path — viewBox 375×68
  The cutout runs from x=133 → x=242 with a smooth U-dip of 36px.
  Both fill + border paths share the same bezier curve.
*/
const FILL_PATH   = "M0,0 L133,0 C148,0 143,36 187.5,36 C232,36 227,0 242,0 L375,0 L375,68 L0,68 Z";
const BORDER_PATH = "M0,0.5 L133,0.5 C148,0.5 143,36.5 187.5,36.5 C232,36.5 227,0.5 242,0.5 L375,0.5";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  testId: string;
}

function NavItem({ href, icon: Icon, label, active, testId }: NavItemProps) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 group" data-testid={testId}>
      <div className={`p-2 rounded-2xl transition-all duration-200 ${active ? "bg-primary/15 scale-110" : "group-hover:bg-white/5"}`}>
        <Icon
          className={`w-6 h-6 transition-colors duration-200 ${active ? "text-primary" : "text-white/35"}`}
          strokeWidth={active ? 2.5 : 1.8}
          fill={active && (href === "/saved") ? "currentColor" : "none"}
        />
      </div>
      <span className={`text-[10px] font-semibold transition-colors duration-200 leading-none ${active ? "text-primary" : "text-white/25"}`}>
        {label}
      </span>
    </Link>
  );
}

export function BottomNav({ hidden = false }: BottomNavProps) {
  const [location] = useLocation();
  const isActive = (path: string) => location === path;

  return (
    <>
      {/* Page spacer so content isn't hidden behind the nav — hidden on desktop */}
      <div className="h-24 md:hidden" />

      <nav
        aria-label="Main navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out will-change-transform"
        style={{ transform: hidden ? "translateY(110%)" : "translateY(0)" }}
      >
        {/* ── Notched bar ── */}
        <div className="relative">
          {/* SVG background + border */}
          <svg
            viewBox="0 0 375 68"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full"
            style={{ height: 68 }}
            aria-hidden="true"
          >
            {/* Fill */}
            <path d={FILL_PATH} fill="rgba(13,13,13,0.97)" />
            {/* Top border with notch cutout */}
            <path
              d={BORDER_PATH}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="1"
            />
            {/* Soft inner glow along the notch curve */}
            <path
              d="M143,36.5 C158,36.5 158,36.5 187.5,36.5 C217,36.5 217,36.5 232,36.5"
              fill="none"
              stroke="rgba(153,222,173,0.12)"
              strokeWidth="1.5"
            />
          </svg>

          {/* ── FAB ── floats centered in the notch */}
          <Link
            href="/sell"
            data-testid="nav-sell"
            className="absolute left-1/2 -translate-x-1/2 focus:outline-none"
            style={{ top: -27 }}
          >
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md scale-125 pointer-events-none" />
            {/* Button */}
            <div className="relative w-[54px] h-[54px] bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/50 hover:scale-105 active:scale-95 transition-transform duration-150">
              <Plus className="w-7 h-7 text-primary-foreground" strokeWidth={2.8} />
            </div>
          </Link>

          {/* ── Nav items row ── */}
          <div
            className="relative flex items-end w-full px-2 pb-5 pt-2"
            style={{ height: 68 }}
          >
            {/* Left two items */}
            <div className="flex flex-1 items-center justify-around">
              <NavItem href="/"        icon={Home}     label="Home"   active={isActive("/")}        testId="nav-home" />
              <NavItem href="/explore" icon={Store}    label="Market" active={isActive("/explore")} testId="nav-market" />
            </div>

            {/* Center gap — matches the notch width */}
            <div className="w-[88px] shrink-0" />

            {/* Right two items */}
            <div className="flex flex-1 items-center justify-around">
              <NavItem href="/saved"   icon={Bookmark} label="Saved"  active={isActive("/saved")}   testId="nav-saved" />
              <NavItem href="/profile" icon={User}     label="Profile" active={isActive("/profile")} testId="nav-profile" />
            </div>
          </div>
        </div>

        {/* Safe-area fill for iPhone home-indicator gap */}
        <div
          className="bg-[#0d0d0d]"
          style={{ height: "env(safe-area-inset-bottom, 0px)" }}
        />
      </nav>
    </>
  );
}
