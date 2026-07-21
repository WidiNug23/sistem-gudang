import { supabase } from "@/lib/supabase";
import { restoreBarang, hapusPermanen } from "../actions";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";

export const revalidate = 0;

export default async function SampahPage() {
  const { data: sampah, error } = await supabase
    .from("barang")
    .select(`
      *,
      daftar_kategori:barang_kategori(
        kategori(nama_kategori)
      )
    `)
    .eq("is_deleted", true)
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching trash data:", error);
  }

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
              <div className="flex items-center gap-2.5">
                <span className="text-red-500 dark:text-red-400 text-lg">🗑️</span>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Deleted Items
                </h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
                Arsip Pembuangan Sementara • Total: {sampah?.length || 0} Unit
              </p>
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="space-y-3">
          {(!sampah || sampah.length === 0) ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-slate-400 font-medium italic text-xs">
                Tidak ada data di tempat pembuangan
              </p>
            </div>
          ) : (
            sampah.map((item) => {
              const allKats = item.daftar_kategori || [];
              const kategoriTampil = allKats[0]?.kategori?.nama_kategori || "Umum";
              const sisaKategori = allKats.length - 1;

              return (
                <div 
                  key={item.id} 
                  className="group flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm gap-4"
                >
                  <div className="flex flex-col md:flex-row items-start gap-6 w-full">
                    {/* Info Barang */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                          {item.nama}
                        </h3>

                        {allKats.length > 0 && (
                          <details className="relative group/details cursor-pointer">
                            <summary className="list-none outline-none">
                              <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-[11px] font-bold border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all inline-block">
                                {kategoriTampil} {sisaKategori > 0 && `+${sisaKategori}`} ▼
                              </span>
                            </summary>
                            <div className="absolute left-0 top-full mt-2 z-[100] w-max min-w-[150px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xl">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 dark:border-slate-800 pb-1">Semua Label:</p>
                              <div className="flex flex-col gap-1.5">
                                {allKats.map((rel: any, idx: number) => (
                                  <span key={idx} className="text-xs text-slate-700 dark:text-slate-300 font-semibold uppercase whitespace-nowrap flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                    {rel.kategori?.nama_kategori}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </details>
                        )}
                      </div>

                      {/* TAMPILAN CATATAN */}
                      {item.catatan && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border-l-2 border-red-500 max-w-2xl leading-relaxed">
                            "{item.catatan}"
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-1">
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                          <span className="opacity-70">📍</span> {item.lokasi || "N/A"}
                        </p>
                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                          <span className="opacity-70">📦</span> Stock: <span className="text-slate-900 dark:text-white font-bold">{item.jumlah}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 w-full md:w-auto mt-4 md:mt-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 self-center">
                      <form action={restoreBarang.bind(null, item.id)} className="flex-1 md:flex-none">
                        <button 
                          type="submit" 
                          className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all uppercase border border-emerald-200 dark:border-emerald-900/50 cursor-pointer"
                        >
                          Restore
                        </button>
                      </form>

                      <DeleteButton 
                        id={Number(item.id)} 
                        action={hapusPermanen} 
                        label="Destroy" 
                        confirmMsg="PERINGATAN: Data akan dihapus permanen. Lanjutkan?" 
                        className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-all uppercase border border-red-200 dark:border-red-900/50 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}