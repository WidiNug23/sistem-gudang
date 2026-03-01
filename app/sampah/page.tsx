import { supabase } from "@/lib/supabase";
import { restoreBarang, hapusPermanen } from "../actions";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";

export const revalidate = 0;

export default async function SampahPage() {
  const { data: sampah } = await supabase
    .from("barang")
    .select(`*, kategori(nama_kategori)`)
    .eq("is_deleted", true)
    .order("id", { ascending: false });

  return (
    <main className="min-h-screen bg-[#0f1115] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-red-500/20 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-red-500/20 text-red-500 p-2 rounded-lg text-2xl">🗑️</span>
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
            sampah.map((item) => (
              <div 
                key={item.id} 
                className="group flex flex-col md:flex-row justify-between items-center bg-[#1a1d23] border border-white/5 p-6 rounded-[24px] hover:border-red-500/30 transition-all shadow-xl hover:shadow-red-500/5"
              >
                <div className="flex flex-col md:flex-row items-center gap-6 w-full">
                  {/* Info Barang */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">
                        {item.nama}
                      </h3>
                      <span className="px-3 py-1 rounded-md bg-black/40 text-slate-500 text-[9px] font-black uppercase tracking-tighter border border-white/5">
                        {item.kategori?.nama_kategori || "No Cat"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-slate-500 text-xs font-medium">
                        <span className="opacity-50">📍</span> {item.lokasi || "N/A"}
                      </p>
                      <p className="text-slate-500 text-xs font-medium">
                        <span className="opacity-50">📦</span> Stock: <span className="text-slate-300 font-bold">{item.jumlah}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                    {/* Form Pulihkan (Server Action) */}
                    <form action={async () => { "use server"; await restoreBarang(item.id); }} className="flex-1 md:flex-none">
                      <button className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black hover:bg-emerald-500 hover:text-white transition-all uppercase tracking-widest">
                        Restore
                      </button>
                    </form>

                    {/* Button Hapus Permanen (Client Component with Confirm) */}
                    <DeleteButton 
                      id={item.id} 
                      action={hapusPermanen} 
                      label="Destroy" 
                      confirmMsg="PERINGATAN: Data akan dihapus permanen dari server. Lanjutkan?" 
                      className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Note */}
        <p className="mt-10 text-center text-slate-600 text-[9px] font-bold uppercase tracking-[0.5em] opacity-30">
          Industrial Logic System v1.0
        </p>
      </div>
    </main>
  );
}