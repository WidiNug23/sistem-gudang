import Link from "next/link";
import ThemeToggleButton from "./ThemeToggleButton";

export default function Navbar() {
  return (
    <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">📦</span>
          <span className="font-bold tracking-tight text-base text-slate-900 dark:text-white">
            GudangPro
          </span>
        </Link>
        
        <ThemeToggleButton />
      </div>
    </header>
  );
}