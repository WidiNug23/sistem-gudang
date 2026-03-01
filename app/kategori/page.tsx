"use client";

import { useEffect, useState, useRef } from "react"; // Tambahkan useRef
import { supabase } from "@/lib/supabase";
import { tambahKategori, hapusKategori, updateKategori } from "../actions";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";

export default function KategoriPage() {
  const [kategori, setKategori] = useState<any[]>([]);
  const [editData, setEditData] = useState<{ id: number; nama: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null); // Referensi ke form

  const loadKategori = async () => {
    const { data } = await supabase
      .from("kategori")
      .select("*")
      .order("id", { ascending: true });
    if (data) setKategori(data);
  };

  useEffect(() => {
    loadKategori();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    // Ambil nilai nama_kategori untuk validasi manual jika perlu
    const nama = formData.get("nama_kategori");
    if (!nama) return;

    if (editData) {
      await updateKategori(formData);
      setEditData(null);
    } else {
      await tambahKategori(formData);
    }

    // RESET FORM SECARA PAKSA
    formRef.current?.reset(); 
    
    // REFRESH DATA
    await loadKategori(); 
  };

  return (
    <main className="min-h-screen bg-[#0f1115] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-end mb-12 border-b border-blue-500/20 pb-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
              Category <span className="text-blue-500">Management</span>
            </h1>
            <p className="text-slate-500 mt-2 uppercase text-[10px] font-bold tracking-[0.3em]">Pengaturan Klasifikasi Inventaris</p>
          </div>
          <Link href="/" className="px-6 py-3 rounded-xl bg-white/5 text-slate-400 font-bold hover:bg-white/10 transition-all border border-white/5">
            ← BACK
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className={`bg-[#1a1d23] border ${editData ? 'border-amber-500/50' : 'border-white/10'} p-6 rounded-[32px] sticky top-10 transition-all`}>
              <h2 className={`font-bold mb-4 uppercase text-xs tracking-widest ${editData ? 'text-amber-500' : 'text-white'}`}>
                {editData ? "Edit Category" : "Add New Category"}
              </h2>
              
              {/* Tambahkan ref={formRef} di sini */}
              <form ref={formRef} action={handleSubmit} className="space-y-4">
                {editData && <input type="hidden" name="id" value={editData.id} />}
                
                <input 
                  key={editData ? `edit-${editData.id}` : 'tambah'} 
                  name="nama_kategori" 
                  defaultValue={editData?.nama || ""}
                  placeholder="e.g. Elektronik" 
                  className="w-full bg-black/40 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all text-sm placeholder:text-slate-700"
                  required
                />
                
                <div className="flex flex-col gap-2">
                  <button type="submit" className={`w-full py-4 rounded-xl font-black text-[10px] tracking-[0.2em] transition-all ${
                    editData 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}>
                    {editData ? "UPDATE CHANGES" : "CREATE CATEGORY"}
                  </button>

                  {editData && (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditData(null);
                        formRef.current?.reset();
                      }}
                      className="w-full py-2 text-[9px] font-bold text-slate-500 uppercase hover:text-white transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            {kategori.length === 0 && <p className="text-slate-600 italic text-sm p-10 text-center">Loading categories...</p>}
            
            {kategori.map((item) => (
              <div key={item.id} className={`group flex justify-between items-center bg-[#1a1d23] border p-5 rounded-2xl transition-all ${
                editData?.id === item.id ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'border-white/5 hover:border-blue-500/30'
              }`}>
                <div className="flex items-center gap-4">
                  <span className="text-slate-600 font-mono text-xs">#{item.id}</span>
                  <p className="text-white font-bold">{item.nama_kategori}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => {
                      setEditData({ id: item.id, nama: item.nama_kategori });
                      window.scrollTo({ top: 0, behavior: 'smooth' }); // Opsional: scroll ke form
                    }}
                    className="text-[10px] font-black text-blue-500/50 hover:text-blue-500 tracking-widest transition-all"
                  >
                    EDIT
                  </button>

                  <DeleteButton 
                    id={item.id} 
                    action={async (id) => {
                       await hapusKategori(id);
                       loadKategori();
                    }} 
                    label="DELETE" 
                    confirmMsg="Hapus kategori ini? Pastikan tidak ada barang yang menggunakannya." 
                    className="text-[10px] font-black text-red-500/30 hover:text-red-500 tracking-widest transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}