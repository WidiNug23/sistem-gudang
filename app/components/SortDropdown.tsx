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
    <div className="relative group">
      <select 
        onChange={(e) => handleChange(e.target.value)}
        value={currentUrutan}
        className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white text-[11px] font-black uppercase tracking-wider outline-none appearance-none cursor-pointer focus:border-blue-500 transition-all"
      >
        {Object.entries(options).map(([key, label]) => (
          <option key={key} value={key} className="bg-[#1a1d23]">
            {label}
          </option>
        ))}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500 text-xs">
        ▼
      </div>
    </div>
  );
}