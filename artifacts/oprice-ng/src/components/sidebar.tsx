import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Home, Search, Bookmark, User, MessageCircle,
  Bell, Settings, HelpCircle, Tag, Car, Shirt,
  Building2, BriefcaseBusiness, ShoppingBag, ChevronRight,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { href: "/",        icon: Home,          label: "Home" },
  { href: "/explore", icon: Search,        label: "Explore" },
  { href: "/saved",   icon: Bookmark,      label: "Saved" },
  { href: "/messages",icon: MessageCircle, label: "Messages" },
  { href: "/profile", icon: User,          label: "My Profile" },
];

const CATEGORIES = [
  { href: "/explore?category=Electronics", icon: ShoppingBag,      label: "Electronics",   color: "#1d3461" },
  { href: "/explore?category=Vehicles",    icon: Car,              label: "Vehicles",      color: "#2d1b00" },
  { href: "/explore?category=Fashion",     icon: Shirt,            label: "Fashion",       color: "#2d0a1a" },
  { href: "/explore?category=Property",    icon: Building2,        label: "Property",      color: "#0a2d1a" },
  { href: "/explore?category=Jobs",        icon: BriefcaseBusiness,label: "Jobs",          color: "#1a0a2d" },
  { href: "/explore?category=Deals",       icon: Tag,              label: "Deals",         color: "#2d1a00" },
];

const BOTTOM_LINKS = [
  { href: "/", icon: Bell,       label: "Notifications" },
  { href: "/", icon: Settings,   label: "Settings" },
  { href: "/", icon: HelpCircle, label: "Help & Support" },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="sidebar-drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 left-0 bottom-0 z-50 flex flex-col w-[300px] max-w-[85vw] bg-[#121212] border-r border-white/6 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-white/5">
              <span className="text-[20px] font-black text-white tracking-tight">O'Price Ng</span>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/6 hover:bg-white/10 transition-colors text-white/50"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile mini-card */}
            <Link href="/profile" onClick={onClose}>
              <div className="mx-4 mt-4 mb-2 flex items-center gap-3 bg-white/4 hover:bg-white/6 transition-colors rounded-2xl px-4 py-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/60 to-primary/10 border-2 border-primary/20 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-white truncate">John Adeyemi</p>
                  <p className="text-[11px] text-white/35 truncate">@johntech · View profile</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 shrink-0 ml-auto" />
              </div>
            </Link>

            {/* Main nav */}
            <div className="px-3 mt-3">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-2 mb-2">Menu</p>
              {NAV_LINKS.map(({ href, icon: Icon, label }) => {
                const active = location === href;
                return (
                  <Link key={href} href={href} onClick={onClose}>
                    <div className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 transition-colors ${
                      active ? "bg-primary/12 text-primary" : "text-white/55 hover:bg-white/4 hover:text-white"
                    }`}>
                      <Icon className="w-5 h-5 shrink-0" strokeWidth={active ? 2.5 : 1.8} />
                      <span className="text-[14px] font-semibold">{label}</span>
                      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="mx-4 my-4 h-px bg-white/5" />

            {/* Categories */}
            <div className="px-3">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-2 mb-2">Categories</p>
              <div className="grid grid-cols-2 gap-2 px-1">
                {CATEGORIES.map(({ href, icon: Icon, label, color }) => (
                  <Link key={label} href={href} onClick={onClose}>
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/6 hover:border-white/12 transition-colors"
                      style={{ backgroundColor: color + "aa" }}
                    >
                      <Icon className="w-4 h-4 text-white/70 shrink-0" />
                      <span className="text-[12px] font-semibold text-white/80 truncate">{label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom links */}
            <div className="px-3 pb-8 border-t border-white/5 pt-4">
              {BOTTOM_LINKS.map(({ href, icon: Icon, label }) => (
                <Link key={label} href={href} onClick={onClose}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/35 hover:bg-white/4 hover:text-white/60 transition-colors mb-0.5">
                    <Icon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.8} />
                    <span className="text-[13px] font-semibold">{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
