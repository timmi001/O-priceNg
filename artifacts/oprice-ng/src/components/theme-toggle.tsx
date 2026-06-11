import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative flex items-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
        isDark ? "bg-primary/30" : "bg-gray-200"
      } ${className}`}
    >
      <span
        className={`absolute flex items-center justify-center w-5 h-5 rounded-full shadow-md transition-all duration-300 ${
          isDark
            ? "translate-x-6 bg-primary"
            : "translate-x-0.5 bg-white"
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-primary-foreground" />
        ) : (
          <Sun className="w-3 h-3 text-amber-500" />
        )}
      </span>
    </button>
  );
}
