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
  
  // State kustom untuk menggantikan alert browser (notifikasi/pesan modal)
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  
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

  // Fungsi pengecekan sebelum hapus dengan modal kustom
  const handleSafeDelete = async (id: number) => {
    const { count, error: checkError } = await supabase
      .from("barang_kategori")
      .select("*", { count: "exact", head: true })
      .eq("kategori_id", id);

    if (checkError) {
      setModalMessage("Database error: Gagal melakukan verifikasi relasi.");
      return;
    }

    if (count && count > 0) {
      setModalMessage("Gagal hapus: Kategori masih digunakan oleh barang termasuk barang di Sampah.");
      return;
    }

    try {
      await hapusKategori(id);
      await loadKategori(); 
    } catch (err) {
      setModalMessage("Terjadi kesalahan sistem saat menghapus.");
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
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Category Management
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mt-0.5">
                Pengaturan Klasifikasi Inventaris
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Form Create/Edit */}
          <div className="md:col-span-1">
            <div className={`bg-white dark:bg-slate-900 border ${editData ? 'border-amber-500/50' : 'border-slate-200 dark:border-slate-800'} p-6 rounded-2xl sticky top-6 transition-all shadow-sm`}>
              <h2 className={`font-black mb-4 uppercase text-xs tracking-wider ${editData ? 'text-amber-500' : 'text-slate-400'}`}>
                {editData ? "Edit Category" : "Add New Category"}
              </h2>
              
              <form ref={formRef} action={handleSubmit} className="space-y-4">
                {editData && <input type="hidden" name="id" value={editData.id} />}
                
                <input 
                  key={editData ? `edit-${editData.id}` : 'tambah'} 
                  name="nama_kategori" 
                  defaultValue={editData?.nama || ""}
                  placeholder="e.g. Elektronik" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all placeholder:text-slate-400 shadow-sm"
                  required
                />
                
                <div className="flex flex-col gap-2">
                  <button type="submit" className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer ${
                    editData 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}>
                    {editData ? "Update Changes" : "Create Category"}
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
               <div className="py-20 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Synchronizing database...</p>
               </div>
            ) : kategori.length === 0 ? (
               <div className="py-20 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">No categories found.</p>
               </div>
            ) : (
              kategori.map((item) => (
                <div key={item.id} className={`group flex justify-between items-center bg-white dark:bg-slate-900 border p-4 rounded-2xl transition-all shadow-sm ${
                  editData?.id === item.id ? 'border-amber-500/50 shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono text-xs">#{item.id}</span>
                    <p className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-tight">{item.nama_kategori}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => {
                        setEditData({ id: item.id, nama: item.nama_kategori });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition-all uppercase px-3 py-1.5 bg-orange-50 dark:bg-orange-950/30 rounded-lg cursor-pointer"
                    >
                      Edit
                    </button>

                    <DeleteButton 
                      id={Number(item.id)} 
                      action={handleSafeDelete}
                      label="Delete" 
                      confirmMsg={`Hapus kategori "${item.nama_kategori}"?`} 
                      className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-100 transition-all uppercase px-3 py-1.5 bg-red-50 dark:bg-red-950/30 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      {/* MODAL NOTIFIKASI KUSTOM (Pengganti Alert Bawaan Browser) */}
      {modalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 w-full max-w-sm shadow-lg text-center">
            
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Informasi Peringatan
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
              {modalMessage}
            </p>

            <button
              type="button"
              onClick={() => setModalMessage(null)}
              className="w-full px-4 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Mengerti
            </button>

          </div>
        </div>
      )}

    </div>
  );
}