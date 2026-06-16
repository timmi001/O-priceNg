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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 left-0 bottom-0 z-50 flex flex-col w-[300px] max-w-[85vw] bg-white dark:bg-[#121212] border-r border-black/8 dark:border-white/6 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-black/6 dark:border-white/5">
              <div className="flex items-center gap-2.5">
                <img src="/logo.jpg" alt="O'Price Ng" className="w-8 h-8 rounded-xl object-cover shrink-0" />
                <span className="text-[19px] font-black tracking-tight">
                  <span className="text-gray-900 dark:text-white">O'Price</span>
                  <span className="text-primary"> Ng</span>
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/6 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-white/50"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile mini-card */}
            <Link href="/profile" onClick={onClose}>
              <div className="mx-4 mt-4 p-3 rounded-2xl bg-black/4 dark:bg-white/4 border border-black/6 dark:border-white/6 flex items-center gap-3 hover:bg-black/8 dark:hover:bg-white/8 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/50 to-primary/10 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-black text-gray-900 dark:text-white truncate">John Adeyemi</p>
                  <p className="text-[11px] text-gray-500 dark:text-white/35">@johntech</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/25 shrink-0" />
              </div>
            </Link>

            {/* Nav links */}
            <nav className="px-3 mt-4 flex-1">
              <p className="px-2 pb-1 text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest">Menu</p>
              {NAV_LINKS.map(({ href, icon: Icon, label }) => {
                const active = location === href;
                return (
                  <Link key={href} href={href} onClick={onClose}>
                    <div className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-0.5 transition-all ${
                      active
                        ? "bg-primary/12 text-primary"
                        : "text-gray-600 dark:text-white/55 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}>
                      <Icon className="w-5 h-5 shrink-0" strokeWidth={active ? 2.5 : 1.8} />
                      <span className={`text-[14px] ${active ? "font-black" : "font-semibold"}`}>{label}</span>
                    </div>
                  </Link>
                );
              })}

              {/* Categories */}
              <p className="px-2 pt-3 pb-1 text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest">Categories</p>
              <div className="grid grid-cols-2 gap-1.5 pb-4">
                {CATEGORIES.map(({ href, icon: Icon, label, color }) => (
                  <Link key={label} href={href} onClick={onClose}>
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all hover:opacity-80 active:scale-95"
                      style={{ backgroundColor: color + "22" }}
                    >
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "cc" }}>
                        <Icon className="w-3.5 h-3.5 text-white/80" />
                      </div>
                      <span className="text-[12px] font-semibold text-gray-700 dark:text-white/70">{label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </nav>

            {/* Bottom links + theme toggle */}
            <div className="px-3 pb-8 border-t border-black/6 dark:border-white/5 pt-3">
              {BOTTOM_LINKS.map(({ href, icon: Icon, label }) => (
                <Link key={label} href={href} onClick={onClose}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-gray-500 dark:text-white/35 hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                    <span className="text-[13px] font-semibold">{label}</span>
                  </div>
                </Link>
              ))}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
