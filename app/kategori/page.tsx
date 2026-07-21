"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { tambahKategori, hapusKategori, updateKategori } from "../actions";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";

export default function KategoriPage() {
  const [kategori, setKategori] = useState<any[]>([]);
  const [editData, setEditData] = useState<{ id: number; nama: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  // Fungsi untuk memuat data kategori
  const loadKategori = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("kategori")
      .select("*")
      .order("id", { ascending: true });
    if (data) setKategori(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadKategori();
  }, []);

  // Fungsi pengecekan sebelum hapus
  const handleSafeDelete = async (id: number) => {
    const { count, error: checkError } = await supabase
      .from("barang_kategori")
      .select("*", { count: "exact", head: true })
      .eq("kategori_id", id);

    if (checkError) {
      alert("Database error: Gagal melakukan verifikasi relasi.");
      return;
    }

    if (count && count > 0) {
      alert("Gagal hapus: Kategori masih digunakan oleh barang.");
      return;
    }

    try {
      await hapusKategori(id);
      await loadKategori(); 
    } catch (err) {
      alert("Terjadi kesalahan sistem saat menghapus.");
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const nama = formData.get("nama_kategori");
    if (!nama) return;

    if (editData) {
      await updateKategori(formData);
      setEditData(null);
    } else {
      await tambahKategori(formData);
    }

    formRef.current?.reset(); 
    await loadKategori(); 
  };

  return (
    <div className="p-4 md:p-8 w-full font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/35 transition-all shadow-sm"
              title="Kembali ke Beranda"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-hover:text-orange-600 dark:group-hover:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Category Management
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
                Pengaturan Klasifikasi Inventaris
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Form Create/Edit */}
          <div className="md:col-span-1">
            <div className={`bg-white dark:bg-slate-900 border ${editData ? 'border-amber-500/50' : 'border-slate-200 dark:border-slate-800'} p-6 rounded-2xl sticky top-6 transition-all shadow-sm`}>
              <h2 className={`font-bold mb-4 uppercase text-xs tracking-wider ${editData ? 'text-amber-500' : 'text-slate-400'}`}>
                {editData ? "Edit Category" : "Add New Category"}
              </h2>
              
              <form ref={formRef} action={handleSubmit} className="space-y-4">
                {editData && <input type="hidden" name="id" value={editData.id} />}
                
                <input 
                  key={editData ? `edit-${editData.id}` : 'tambah'} 
                  name="nama_kategori" 
                  defaultValue={editData?.nama || ""}
                  placeholder="e.g. Elektronik" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all placeholder:text-slate-400 shadow-sm"
                  required
                />
                
                <div className="flex flex-col gap-2">
                  <button type="submit" className={`w-full py-3.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                    editData 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
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
                      className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List Categories */}
          <div className="md:col-span-2 space-y-3">
            {isLoading ? (
               <p className="text-slate-400 italic text-xs p-10 text-center">Synchronizing database...</p>
            ) : kategori.length === 0 ? (
               <p className="text-slate-400 italic text-xs p-10 text-center">No categories found.</p>
            ) : (
              kategori.map((item) => (
                <div key={item.id} className={`group flex justify-between items-center bg-white dark:bg-slate-900 border p-4 rounded-2xl transition-all shadow-sm ${
                  editData?.id === item.id ? 'border-amber-500/50 shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono text-xs">#{item.id}</span>
                    <p className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-tight">{item.nama_kategori}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        setEditData({ id: item.id, nama: item.nama_kategori });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-all uppercase px-2 py-1 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-lg"
                    >
                      Edit
                    </button>

                    <DeleteButton 
                      id={Number(item.id)} 
                      action={handleSafeDelete}
                      label="Delete" 
                      confirmMsg="Hapus kategori ini? Pastikan tidak ada barang yang menggunakannya." 
                      className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 transition-colors px-2.5 py-1 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}