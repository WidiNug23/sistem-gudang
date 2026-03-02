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
    <main className="min-h-screen bg-[#0f1115] p-6 md:p-10 font-sans text-slate-200">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-red-500/20 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-red-500/20 text-red-500 p-2 rounded-lg text-2xl shadow-[0_0_20px_rgba(239,68,68,0.2)]">🗑️</span>
              <h1 className="text-4xl font-black text-red-500 tracking-tighter uppercase">Deleted Items</h1>
            </div>
            <p className="text-slate-500 uppercase text-[10px] font-bold tracking-[0.3em] ml-1">
              Arsip Pembuangan Sementara • Total: {sampah?.length || 0} Unit
            </p>
          </div>
          <Link 
            href="/" 
            className="px-6 py-3 rounded-xl bg-white/5 text-slate-400 font-bold hover:bg-white/10 transition-all border border-white/5 flex items-center gap-2 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            DASHBOARD
          </Link>
        </div>

        {/* List Section */}
        <div className="space-y-4">
          {(!sampah || sampah.length === 0) ? (
            <div className="text-center py-20 bg-[#1a1d23] rounded-[32px] border border-dashed border-white/10">
              <p className="text-slate-600 font-medium italic tracking-widest uppercase text-xs">
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
                  className="group flex flex-col md:flex-row justify-between items-center bg-[#1a1d23] border border-white/5 p-6 rounded-[24px] hover:border-red-500/30 transition-all shadow-xl"
                >
                  <div className="flex flex-col md:flex-row items-start gap-6 w-full">
                    {/* Info Barang */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors uppercase tracking-tight">
                          {item.nama}
                        </h3>

                        {allKats.length > 0 && (
                          <details className="relative group/details cursor-pointer">
                            <summary className="list-none outline-none">
                              <span className="px-3 py-1 rounded-md bg-red-500/10 text-red-400 text-[9px] font-black uppercase tracking-tighter border border-red-500/20 hover:bg-red-500 hover:text-white transition-all inline-block">
                                {kategoriTampil} {sisaKategori > 0 && `+${sisaKategori}`} ▼
                              </span>
                            </summary>
                            <div className="absolute left-0 top-full mt-2 z-[100] w-max min-w-[150px] bg-[#0f1115] border border-white/10 rounded-xl p-3 shadow-2xl animate-in fade-in zoom-in duration-200">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Semua Label:</p>
                              <div className="flex flex-col gap-1.5">
                                {allKats.map((rel: any, idx: number) => (
                                  <span key={idx} className="text-[10px] text-slate-300 font-bold uppercase whitespace-nowrap flex items-center gap-2">
                                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                    {rel.kategori?.nama_kategori}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </details>
                        )}
                      </div>

                      {/* TAMPILAN CATATAN (DITAMBAHKAN DI SINI) */}
                      {item.catatan ? (
                        <div className="mb-4 mt-1">
                          <p className="text-[11px] text-slate-500 italic bg-black/20 p-3 rounded-xl border-l-2 border-red-500/30 max-w-2xl leading-relaxed">
                            "{item.catatan}"
                          </p>
                        </div>
                      ) : (
                        <div className="mb-2"></div>
                      )}

                      <div className="flex items-center gap-4">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          <span className="opacity-50">📍</span> {item.lokasi || "N/A"}
                        </p>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                          <span className="opacity-50">📦</span> Stock: <span className="text-slate-300 font-black">{item.jumlah}</span>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 w-full md:w-auto mt-6 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5 self-center">
                      <form action={restoreBarang.bind(null, item.id)} className="flex-1 md:flex-none">
                        <button 
                          type="submit" 
                          className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest active:scale-95"
                        >
                          Restore
                        </button>
                      </form>

                      <DeleteButton 
                        id={Number(item.id)} 
                        action={hapusPermanen} 
                        label="Destroy" 
                        confirmMsg="PERINGATAN: Data akan dihapus permanen. Lanjutkan?" 
                        className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest active:scale-95 border border-red-500/10"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <p className="mt-10 text-center text-slate-600 text-[9px] font-bold uppercase tracking-[0.5em] opacity-30">
          Industrial Logic System v1.0
        </p>
      </div>
    </main>
  );
}