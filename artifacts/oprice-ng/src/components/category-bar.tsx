import { CATEGORY_CONFIG } from "@/lib/categories";

interface CategoryBarProps {
  active: string | null;
  onChange: (slug: string | null) => void;
}

export function CategoryBar({ active, onChange }: CategoryBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
      {/* All */}
      <button
        onClick={() => onChange(null)}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full shrink-0 text-[12px] font-semibold transition-all active:scale-95 border ${
          active === null
            ? "bg-primary text-white border-primary shadow-sm shadow-primary/30"
            : "bg-black/5 dark:bg-white/6 text-gray-600 dark:text-white/55 border-black/8 dark:border-white/8 hover:bg-black/8 dark:hover:bg-white/10"
        }`}
      >
        All
      </button>

      {CATEGORY_CONFIG.map(({ label, slug, icon: Icon, color }) => {
        const isActive = active === slug;
        return (
          <button
            key={slug}
            onClick={() => onChange(isActive ? null : slug)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full shrink-0 text-[12px] font-semibold transition-all active:scale-95 border ${
              isActive
                ? "text-white border-transparent shadow-sm"
                : "bg-black/5 dark:bg-white/6 text-gray-600 dark:text-white/55 border-black/8 dark:border-white/8 hover:bg-black/8 dark:hover:bg-white/10"
            }`}
            style={isActive ? { backgroundColor: color, borderColor: color } : {}}
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-gray-500 dark:text-white/40"}`} />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
