import { supabase } from "@/lib/supabase";
import { softDeleteBarang } from "./actions";
import Link from "next/link";
import DeleteButton from "./components/DeleteButton";

export const revalidate = 0;

export default async function Home() {
  const { data: barang } = await supabase
    .from("barang")
    .select(`*, kategori(nama_kategori)`)
    .eq("is_deleted", false)
    .order("id", { ascending: false });

  return (
    <main className="min-h-screen w-full bg-[#0f1115] p-4 md:p-10">
      {/* Header Full Width */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-5xl font-black tracking-[calc(-0.05em)] text-white flex items-center gap-3">
            <span className="bg-blue-600 p-2 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">📦</span>
            GUDANG<span className="text-blue-500 italic font-light">PRO</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium tracking-wide">Sistem Monitoring Stok Real-time</p>
        </div>
        
<div className="flex gap-4 w-full md:w-auto">
  <Link href="/kategori" className="flex-1 md:flex-none text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-slate-400">
    🏷️ Kategori
  </Link>
  <Link href="/sampah" className="flex-1 md:flex-none text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-slate-400">
    🗑️ Sampah
  </Link>
  <Link href="/tambah" className="flex-[2] md:flex-none text-center px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:-translate-y-1">
    + TAMBAH BARANG
  </Link>
</div>
      </div>

      {/* Grid Full screen width */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {barang?.map((item) => (
          <div key={item.id} className="group relative bg-[#1a1d23] border border-white/5 rounded-[32px] p-1 transition-all hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                  {item.kategori?.nama_kategori || "Umum"}
                </span>
                <Link href={`/edit/${item.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 p-2 rounded-lg text-xs font-bold hover:text-blue-400">
                  EDIT
                </Link>
              </div>

              <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{item.nama}</h3>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-8">
                <span className="opacity-50">📍</span> {item.lokasi || "RAK TIDAK TERDAFTAR"}
              </div>

              <div className="flex justify-between items-end bg-black/20 rounded-[24px] p-5 border border-white/5">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-tighter">Stock Available</p>
                  <p className="text-4xl font-black text-white tabular-nums">{item.jumlah}</p>
                </div>
                <DeleteButton 
                  id={item.id} 
                  action={softDeleteBarang} 
                  label="SHRED" 
                  confirmMsg="Kirim ke pembuangan?" 
                  className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black hover:bg-red-500 hover:text-white transition-all"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}