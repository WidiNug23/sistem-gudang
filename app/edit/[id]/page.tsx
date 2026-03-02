import { supabase } from "@/lib/supabase";
import { updateBarang } from "@/app/actions";
import Link from "next/link";
import KategoriSelector from "@/app/components/KategoriSelector";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: Props) {
  // 1. Resolve params di awal
  const { id: targetId } = await params;

  // 2. Fetch data secara paralel
  const [barangRes, kategoriRes, relasiRes] = await Promise.all([
    supabase.from("barang").select("*").eq("id", targetId).single(),
    supabase.from("kategori").select("*").order("nama_kategori", { ascending: true }),
    supabase.from("barang_kategori").select("kategori_id").eq("barang_id", targetId)
  ]);

  const item = barangRes.data;
  const daftarKategori = kategoriRes.data;
  const selectedKategoriIds = relasiRes.data?.map(r => String(r.kategori_id)) || [];

  // 3. Error Handling jika data kosong
  if (barangRes.error || !item) {
    return (
      <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center gap-4">
        <div className="text-white text-center italic opacity-50 font-black tracking-widest">
          UNIT NOT FOUND // 404
        </div>
        <Link href="/" className="text-blue-500 text-xs font-bold uppercase hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4 md:p-6">
      <div className="bg-[#1a1d23] border border-white/10 p-8 md:p-12 rounded-[40px] w-full max-w-lg relative overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Update <span className="text-blue-500">Logistics</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 border-l-2 border-blue-500 pl-3">
            Ref: #{item.id}
          </p>
        </div>

        {/* Form */}
        <form action={updateBarang} className="space-y-6">
          <input type="hidden" name="id" value={item.id} />

          {/* Nama Barang */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Item Designation</label>
            <input 
              name="nama" 
              defaultValue={item.nama} 
              className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white focus:border-blue-500 outline-none transition-all" 
              required 
            />
          </div>

          {/* Kategori */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Sector Access Control</label>
            <KategoriSelector 
              allKategori={daftarKategori || []} 
              selectedIds={selectedKategoriIds} 
            />
          </div>

          {/* Stock & Lokasi */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-600 uppercase ml-2">Quantity</label>
              <input 
                name="jumlah" 
                type="number" 
                defaultValue={item.jumlah} 
                className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-600 uppercase ml-2">Position</label>
              <input 
                name="lokasi" 
                defaultValue={item.lokasi} 
                className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all" 
              />
            </div>
          </div>

          {/* Catatan */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Additional Notes</label>
            <textarea 
              name="catatan" 
              defaultValue={item.catatan}
              rows={3} 
              className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <button 
              type="submit" 
              className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black tracking-widest hover:bg-blue-500 transition-all uppercase text-xs shadow-[0_10px_20px_rgba(37,99,235,0.2)] active:scale-95"
            >
              Commit Changes
            </button>
            
            {/* Navigasi Link yang diperbaiki */}
            <Link 
              href="/" 
              className="flex-1 bg-white/5 text-slate-400 py-5 rounded-2xl font-bold text-center hover:bg-white/10 border border-white/5 uppercase text-[10px] flex items-center justify-center transition-all active:scale-95"
            >
              Abort
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}