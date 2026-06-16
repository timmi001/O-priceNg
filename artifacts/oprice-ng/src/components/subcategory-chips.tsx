import { motion, AnimatePresence } from "framer-motion";
import { CATEGORY_CONFIG, ALL_LABEL } from "@/lib/categories";

interface SubcategoryChipsProps {
  categorySlug: string | null;
  active: string | null;
  onChange: (sub: string | null) => void;
}

export function SubcategoryChips({ categorySlug, active, onChange }: SubcategoryChipsProps) {
  const cat = CATEGORY_CONFIG.find(c => c.slug === categorySlug);

  return (
    <AnimatePresence>
      {cat && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-2 pb-0.5">
            {/* All sub */}
            <button
              onClick={() => onChange(null)}
              className={`px-3.5 py-1.5 rounded-full shrink-0 text-[11px] font-semibold transition-all active:scale-95 border ${
                active === null
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-black/4 dark:bg-white/5 text-gray-500 dark:text-white/45 border-black/6 dark:border-white/6 hover:bg-black/8 dark:hover:bg-white/8"
              }`}
            >
              {ALL_LABEL}
            </button>

            {cat.subcategories.map(sub => {
              const isActive = active === sub;
              return (
                <button
                  key={sub}
                  onClick={() => onChange(isActive ? null : sub)}
                  className={`px-3.5 py-1.5 rounded-full shrink-0 text-[11px] font-semibold transition-all active:scale-95 border whitespace-nowrap ${
                    isActive
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-black/4 dark:bg-white/5 text-gray-500 dark:text-white/45 border-black/6 dark:border-white/6 hover:bg-black/8 dark:hover:bg-white/8"
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
