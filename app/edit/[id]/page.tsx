import { supabase } from "@/lib/supabase";
import { updateBarang } from "@/app/actions";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  
  // Menunggu params ID dari URL
  const resolvedParams = await params;
  const targetId = resolvedParams.id;

  // Fetch data barang & kategori secara paralel agar lebih cepat
  const [barangRes, kategoriRes] = await Promise.all([
    supabase.from("barang").select("*").eq("id", targetId).single(),
    supabase.from("kategori").select("*")
  ]);

  const item = barangRes.data;
  const daftarKategori = kategoriRes.data;
  const error = barangRes.error;

  // View jika barang tidak ada
  if (error || !item) {
    return (
      <main className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-8xl font-black text-red-600/20 tracking-tighter absolute">404</h1>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Unit Not Found</h2>
          <p className="text-slate-500 mt-2 mb-8 uppercase text-[10px] tracking-[0.3em]">ID: {targetId} • Status: Invalid</p>
          <Link href="/" className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-slate-300 font-bold hover:bg-white/10 transition-all">
            RETURN TO BASE
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f1115] flex items-center justify-center p-4 md:p-6">
      <div className="bg-[#1a1d23] border border-white/10 p-8 md:p-12 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-lg relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] rounded-full"></div>
        
        <div className="mb-10 relative z-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
            Update <span className="text-blue-500">Logistics</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 border-l-2 border-blue-500 pl-3">
            Modify Inventory Unit • Ref: #{item.id}
          </p>
        </div>

        <form action={updateBarang} className="space-y-6 relative z-10">
          {/* Hidden ID - Wajib ada agar updateBarang tahu ID mana yang diubah */}
          <input type="hidden" name="id" value={item.id} />

          {/* Nama Inventaris */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Item Designation</label>
            <input 
              name="nama"
              defaultValue={item.nama}
              className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-700" 
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stok */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Quantity</label>
              <input 
                name="jumlah"
                type="number" 
                defaultValue={item.jumlah}
                className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white focus:border-blue-500 outline-none transition-all" 
                required
              />
            </div>

            {/* Kategori */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Class</label>
              <div className="relative">
                <select 
                  name="kategori_id"
                  defaultValue={item.kategori_id}
                  className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  required
                >
                  {daftarKategori?.map((kat) => (
                    <option key={kat.id} value={kat.id} className="bg-[#1a1d23]">
                      {kat.nama_kategori}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">▼</div>
              </div>
            </div>
          </div>

          {/* Lokasi */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Warehouse Sector</label>
            <input 
              name="lokasi"
              defaultValue={item.lokasi}
              className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-white focus:border-blue-500 outline-none transition-all" 
              placeholder="e.g. ZONE-A / SHELF-12"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4 pt-6">
            <button 
              type="submit" 
              className="flex-[2] bg-blue-600 text-white py-5 rounded-2xl font-black tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:scale-95 transition-all uppercase text-xs"
            >
              Commit Changes
            </button>
            <Link 
              href="/" 
              className="flex-1 bg-white/5 text-slate-400 py-5 rounded-2xl font-bold text-center hover:bg-white/10 transition-all border border-white/5 uppercase text-[10px] flex items-center justify-center tracking-widest"
            >
              Abort
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}