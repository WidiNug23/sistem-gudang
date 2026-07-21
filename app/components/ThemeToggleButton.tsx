"use client";

import { useState, useEffect } from "react";

export default function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(checkDark);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  if (!mounted) {
    return <div className="w-20 h-9 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
      title="Ganti Tema Terang/Gelap"
    >
      <span>{isDarkMode ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline">{isDarkMode ? "Gelap" : "Terang"}</span>
    </button>
  );
}