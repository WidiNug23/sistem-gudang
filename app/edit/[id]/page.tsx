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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 font-sans">
        <div className="text-slate-900 dark:text-white text-center italic opacity-60 font-black tracking-widest text-sm">
          UNIT NOT FOUND // 404
        </div>
        <Link href="/" className="text-orange-600 dark:text-orange-400 text-xs font-bold uppercase hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-6 font-sans transition-colors">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-10 rounded-2xl w-full max-w-3xl relative overflow-hidden shadow-sm">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Update <span className="text-orange-600 dark:text-orange-400">Logistics</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1 border-l-2 border-orange-500 pl-3">
              Ref: #{item.id}
            </p>
          </div>
          <Link 
            href="/" 
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/35 transition-all shadow-sm"
            title="Kembali ke Beranda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 hover:text-orange-600 dark:hover:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {/* Form */}
        <form action={updateBarang} className="space-y-5">
          <input type="hidden" name="id" value={item.id} />

          {/* Grid Layout 2 Kolom untuk Efisiensi Ruang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Kolom Kiri: Nama & Kategori */}
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  Nama Barang
                </label>
                <input 
                  name="nama" 
                  defaultValue={item.nama} 
                  placeholder="Contoh: Kayu Jati"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all shadow-sm placeholder:text-slate-400" 
                  required 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  Pilih Kategori (Opsional)
                </label>
                <KategoriSelector 
                  allKategori={daftarKategori || []} 
                  selectedIds={selectedKategoriIds} 
                />
              </div>
            </div>

            {/* Kolom Kanan: Kuantitas, Posisi, dan Catatan */}
            <div className="space-y-5 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    Quantity (Jumlah)
                  </label>
                  <input 
                    name="jumlah" 
                    type="number" 
                    defaultValue={item.jumlah} 
                    placeholder="0"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all shadow-sm placeholder:text-slate-400" 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    Lokasi Barang 
                  </label>
                  <input 
                    name="lokasi" 
                    defaultValue={item.lokasi} 
                    placeholder="Contoh: Etalase 8"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all shadow-sm placeholder:text-slate-400" 
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex-1 flex flex-col">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  Catatan Tambahan
                </label>
                <textarea 
                  name="catatan" 
                  defaultValue={item.catatan}
                  rows={3} 
                  placeholder="Tambahkan detail atau spesifikasi barang..."
                  className="w-full flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all resize-none shadow-sm placeholder:text-slate-400"
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="submit" 
              className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-bold tracking-wider transition-all uppercase text-xs shadow-sm active:scale-95 cursor-pointer"
            >
              Simpan Perubahan
            </button>
            
            <Link 
              href="/" 
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3.5 rounded-xl font-bold text-center hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 uppercase text-xs flex items-center justify-center transition-all active:scale-95"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}