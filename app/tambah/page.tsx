import { supabase } from "@/lib/supabase";
import { tambahBarang } from "../actions";
import Link from "next/link";
import KategoriSelector from "../components/KategoriSelector";

export const revalidate = 0;

export default async function TambahPage() {
  const { data: daftarKategori } = await supabase
    .from("kategori")
    .select("id, nama_kategori")
    .order("nama_kategori", { ascending: true });

  return (
    <main className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4 md:p-6">
      <div className="bg-[#1a1d23] border border-white/10 p-8 md:p-12 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-lg relative overflow-hidden">
        <div className="mb-10 relative z-10">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Input <span className="text-blue-500">Logistics</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 border-l-2 border-blue-500 pl-3">
            Register New Inventory Unit
          </p>
        </div>

        <form action={tambahBarang} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Item Designation</label>
            <input name="nama" className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" required />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Sector Classification</label>
            <KategoriSelector allKategori={daftarKategori || []} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[9px] font-bold text-slate-600 uppercase ml-2">Quantity</label>
               <input name="jumlah" type="number" className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-blue-500" required />
            </div>
            <div className="space-y-1">
               <label className="text-[9px] font-bold text-slate-600 uppercase ml-2">Position</label>
               <input name="lokasi" className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* INPUT CATATAN */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Additional Notes</label>
            <textarea 
              name="catatan" 
              rows={3} 
              placeholder="Tambahkan detail atau spesifikasi barang..."
              className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <button type="submit" className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black tracking-widest hover:bg-blue-500 transition-all uppercase text-xs">PROCESS DATA</button>
            <Link href="/" className="flex-1 bg-white/5 text-slate-400 py-5 rounded-2xl font-bold text-center hover:bg-white/10 transition-all border border-white/5 uppercase text-[10px] flex items-center justify-center">Abort</Link>
          </div>
        </form>
      </div>
    </main>
  );
}