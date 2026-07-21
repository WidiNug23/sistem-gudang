"use client";
import { useState, useMemo } from "react";

export default function KategoriSelector({ 
  allKategori, 
  selectedIds = [] 
}: { 
  allKategori: any[], 
  selectedIds?: string[] 
}) {
  const [selected, setSelected] = useState<string[]>(selectedIds);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter kategori berdasarkan input pencarian
  const filteredKategori = useMemo(() => {
    return allKategori.filter((kat) =>
      kat.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allKategori, searchTerm]);

  const toggleKategori = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Search Bar Internal */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Cari kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 py-3.5 pl-10 pr-4 rounded-xl text-slate-900 dark:text-white text-xs font-medium outline-none focus:border-orange-500 transition-all placeholder:text-slate-400 shadow-sm"
        />
      </div>

      {/* Container Item Kategori */}
      <div className="flex flex-wrap gap-2 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 max-h-[180px] overflow-y-auto shadow-sm">
        {filteredKategori.length > 0 ? (
          filteredKategori.map((kat) => (
            <label 
              key={kat.id} 
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase cursor-pointer transition-all border select-none ${
                selected.includes(String(kat.id)) 
                  ? "bg-orange-600 border-orange-500 text-white shadow-sm" 
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <input 
                type="checkbox"
                name="kategori" 
                value={kat.id}
                checked={selected.includes(String(kat.id))}
                onChange={() => toggleKategori(String(kat.id))}
                className="hidden"
              />
              {kat.nama_kategori}
            </label>
          ))
        ) : (
          <div className="w-full py-4 text-center text-xs font-medium text-slate-400 italic">
            Kategori tidak ditemukan
          </div>
        )}
      </div>

      {/* Indikator Jumlah Terpilih */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 ml-1">
          <div className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {selected.length} Sector(s) Selected
          </span>
        </div>
      )}
    </div>
  );
}