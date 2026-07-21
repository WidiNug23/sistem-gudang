"use client";

import { useRouter } from "next/navigation";

export default function SortDropdown({ 
  currentUrutan, 
  currentKategori,
  options 
}: { 
  currentUrutan: string, 
  currentKategori?: string,
  options: Record<string, string> 
}) {
  const router = useRouter();

  const handleChange = (val: string) => {
    const params = new URLSearchParams();
    if (currentKategori && currentKategori !== "semua") {
      params.set("kategori", currentKategori);
    }
    params.set("urutan", val);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative group font-sans">
      <select 
        onChange={(e) => handleChange(e.target.value)}
        value={currentUrutan}
        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 pr-10 rounded-xl text-slate-900 dark:text-white text-xs font-semibold uppercase tracking-wider outline-none appearance-none cursor-pointer focus:border-orange-500 transition-all shadow-sm"
      >
        {Object.entries(options).map(([key, label]) => (
          <option key={key} value={key} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            {label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 text-xs transition-colors">
        ▼
      </div>
    </div>
  );
}