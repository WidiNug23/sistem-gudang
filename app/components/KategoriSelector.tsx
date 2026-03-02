// components/KategoriSelector.tsx
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
    <div className="space-y-4">
      {/* Search Bar Internal */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Cari kategori..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-black/40 border border-white/5 py-3 pl-11 pr-4 rounded-xl text-white text-[11px] font-bold uppercase tracking-wider outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
        />
      </div>

      {/* Container Item Kategori */}
      <div className="flex flex-wrap gap-2 p-4 bg-black/20 rounded-2xl border border-white/5 max-h-[200px] overflow-y-auto no-scrollbar">
        {filteredKategori.length > 0 ? (
          filteredKategori.map((kat) => (
            <label 
              key={kat.id} 
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase cursor-pointer transition-all border select-none ${
                selected.includes(String(kat.id)) 
                  ? "bg-blue-600 border-blue-500 text-white shadow-[0_5px_15px_rgba(37,99,235,0.3)]" 
                  : "bg-white/5 border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300"
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
          <div className="w-full py-4 text-center text-[10px] font-black text-slate-700 uppercase tracking-widest italic">
            Kategori tidak ditemukan
          </div>
        )}
      </div>

      {/* Indikator Jumlah Terpilih */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 ml-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {selected.length} Sector(s) Selected
          </span>
        </div>
      )}
    </div>
  );
}