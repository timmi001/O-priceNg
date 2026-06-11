import { Link, useLocation } from "wouter";
import {
  Home, Search, Bookmark, User, MessageCircle, Plus,
  ShoppingBag, Car, Shirt, Building2, BriefcaseBusiness, Tag,
  Bell, Settings, HelpCircle,
} from "lucide-react";

const NAV_LINKS = [
  { href: "/",         icon: Home,          label: "Home"      },
  { href: "/explore",  icon: Search,        label: "Explore"   },
  { href: "/saved",    icon: Bookmark,      label: "Saved"     },
  { href: "/messages", icon: MessageCircle, label: "Messages"  },
  { href: "/profile",  icon: User,          label: "Profile"   },
];

const CATEGORIES = [
  { href: "/explore?category=Electronics", icon: ShoppingBag,       label: "Electronics", color: "#1d3461" },
  { href: "/explore?category=Vehicles",    icon: Car,               label: "Vehicles",    color: "#2d1b00" },
  { href: "/explore?category=Fashion",     icon: Shirt,             label: "Fashion",     color: "#2d0a1a" },
  { href: "/explore?category=Property",    icon: Building2,         label: "Property",    color: "#0a2d1a" },
  { href: "/explore?category=Jobs",        icon: BriefcaseBusiness, label: "Jobs",        color: "#1a0a2d" },
  { href: "/explore?category=Deals",       icon: Tag,               label: "Deals",       color: "#2d1a00" },
];

const BOTTOM_LINKS = [
  { href: "/", icon: Bell,       label: "Notifications" },
  { href: "/", icon: Settings,   label: "Settings"      },
  { href: "/", icon: HelpCircle, label: "Help & Support"},
];

export function DesktopNav() {
  const [location] = useLocation();
  const isActive = (path: string) => location === path;

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[220px] bg-[#0d0d0d] border-r border-white/6 z-30 overflow-y-auto">

      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/5">
        <Link href="/">
          <span className="text-[22px] font-black text-white tracking-tight">O'Price Ng</span>
          <p className="text-[11px] text-white/25 font-medium mt-0.5">Nigerian Marketplace</p>
        </Link>
      </div>

      {/* Sell CTA */}
      <div className="px-4 pt-4 pb-3">
        <Link href="/sell">
          <div className="flex items-center justify-center gap-2 w-full bg-primary rounded-2xl py-2.5 px-4 shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all duration-150">
            <Plus className="w-4 h-4 text-primary-foreground" strokeWidth={2.8} />
            <span className="text-[14px] font-black text-primary-foreground">Sell Now</span>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="px-2 pb-2 flex-1">
        <p className="px-3 pt-3 pb-1.5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Menu</p>
        {NAV_LINKS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 ${
                active
                  ? "bg-primary/12 text-primary"
                  : "text-white/45 hover:text-white/80 hover:bg-white/5"
              }`}>
                <Icon
                  className="w-5 h-5 shrink-0"
                  strokeWidth={active ? 2.5 : 1.8}
                  fill={active && href === "/saved" ? "currentColor" : "none"}
                />
                <span className={`text-[13px] font-${active ? "black" : "semibold"}`}>{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </div>
            </Link>
          );
        })}

        {/* Categories */}
        <p className="px-3 pt-4 pb-1.5 text-[10px] font-bold text-white/20 uppercase tracking-widest">Categories</p>
        {CATEGORIES.map(({ href, icon: Icon, label, color }) => (
          <Link key={label} href={href}>
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-0.5 text-white/45 hover:text-white/80 hover:bg-white/5 transition-all duration-150">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "cc" }}>
                <Icon className="w-3.5 h-3.5 text-white/80" />
              </div>
              <span className="text-[12px] font-semibold">{label}</span>
            </div>
          </Link>
        ))}
      </nav>

      {/* Bottom utility links */}
      <div className="px-2 pb-6 border-t border-white/5 pt-3">
        {BOTTOM_LINKS.map(({ href, icon: Icon, label }) => (
          <Link key={label} href={href}>
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-0.5 text-white/30 hover:text-white/60 hover:bg-white/5 transition-all duration-150">
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              <span className="text-[12px] font-semibold">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
