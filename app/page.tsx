import { supabase } from "@/lib/supabase";
import { softDeleteBarang } from "./actions";
import Link from "next/link";
import DeleteButton from "./components/DeleteButton";
import SortDropdown from "./components/SortDropdown";

export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; urutan?: string; cari?: string }>;
}) {
  const filters = await searchParams;
  const filterKategori = filters.kategori;
  const urutan = filters.urutan || "terbaru";
  const kataKunci = filters.cari || "";

  // 1. Mengambil daftar kategori untuk filter bar
  const { data: listKategori } = await supabase
    .from("kategori")
    .select("id, nama_kategori")
    .order("nama_kategori", { ascending: true });

  // 2. Membangun Query
  // PERBAIKAN: Menggunakan join standar (tanpa !inner secara default) 
  // agar data tidak hilang jika relasi kategori kosong, kecuali saat filter kategori aktif.
  let query = supabase
    .from("barang")
    .select(`
      *,
      barang_kategori${filterKategori && filterKategori !== "semua" ? "!inner" : ""}(kategori_id),
      daftar_kategori:barang_kategori(
        kategori(nama_kategori)
      )
    `)
    .eq("is_deleted", false);

  if (kataKunci) {
    query = query.ilike("nama", `%${kataKunci}%`);
  }

  if (filterKategori && filterKategori !== "semua") {
    query = query.eq("barang_kategori.kategori_id", filterKategori);
  }

  // 3. Logika Pengurutan
  switch (urutan) {
    case "terlama": query = query.order("created_at", { ascending: true }); break;
    case "terupdate": query = query.order("updated_at", { ascending: false }); break;
    case "terbanyak": query = query.order("jumlah", { ascending: false }); break;
    case "tersedikit": query = query.order("jumlah", { ascending: true }); break;
    default: query = query.order("created_at", { ascending: false });
  }

  const { data: barang } = await query;

  const sortLabels = {
    terbaru: "Data Terbaru",
    terlama: "Data Terlama",
    terbanyak: "Stok Terbanyak",
    tersedikit: "Stok Tersedikit",
    // terupdate: "Baru Diupdate"
  };

  return (
    <main className="min-h-screen w-full bg-[#0f1115] p-4 md:p-10 font-sans text-slate-200">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12 border-b border-white/5 pb-10">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white flex items-center gap-4">
            <span className="bg-gradient-to-br from-blue-600 to-blue-400 p-2.5 rounded-2xl shadow-[0_10px_25px_rgba(37,99,235,0.4)]">📦</span>
            GUDANG<span className="text-blue-500 italic font-light">PRO</span>
          </h1>
          <p className="text-slate-500 mt-3 font-bold uppercase text-[11px] tracking-[0.3em] border-l-2 border-blue-600 pl-4">Management & Logistics Dashboard</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <form className="relative flex items-center flex-1 md:min-w-[400px] group">
            <input 
              name="cari"
              defaultValue={kataKunci}
              placeholder="Cari unit barang..."
              className="w-full bg-white/5 border border-white/10 py-4 pl-6 pr-16 rounded-2xl text-white text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white/[0.08] transition-all placeholder:text-slate-600"
            />
            <button type="submit" className="absolute right-2 bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-all shadow-lg active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <input type="hidden" name="kategori" value={filterKategori || ""} />
            <input type="hidden" name="urutan" value={urutan} />
          </form>

          <div className="flex gap-3">
            <Link href="/kategori" className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-black uppercase tracking-widest">🏷️ Kategori</Link>
            <Link href="/sampah" className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-black uppercase tracking-widest">🗑️ Sampah</Link>
            <Link href="/tambah" className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-xl text-xs tracking-widest">+ TAMBAH UNIT</Link>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-wrap items-end gap-8 mb-12 bg-[#16191f] p-8 rounded-[40px] border border-white/5 shadow-2xl">
        <div className="flex flex-col gap-4 flex-1 min-w-[300px]">
          <span className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1">Kategori Barang</span>
          <div className="flex bg-black/40 rounded-2xl p-2 border border-white/5 overflow-x-auto no-scrollbar gap-2">
            <Link 
              href={`?urutan=${urutan}&cari=${kataKunci}`} 
              className={`px-6 py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${!filterKategori || filterKategori === 'semua' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >SEMUA</Link>
            {listKategori?.map((kat) => (
              <Link 
                key={kat.id}
                href={`?kategori=${kat.id}&urutan=${urutan}&cari=${kataKunci}`}
                className={`px-6 py-3 rounded-xl text-xs font-black transition-all uppercase whitespace-nowrap ${filterKategori === String(kat.id) ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >{kat.nama_kategori}</Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full md:w-80">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Urutan</span>
          <SortDropdown currentUrutan={urutan} currentKategori={filterKategori} options={sortLabels} />
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {barang?.length === 0 ? (
          <div className="col-span-full py-40 text-center border-2 border-dashed border-white/10 rounded-[60px] bg-white/[0.02]">
            <p className="text-slate-600 font-black uppercase tracking-[0.5em] text-sm">Unit Logistik Tidak Ditemukan</p>
          </div>
        ) : (
          barang?.map((item) => {
            const allKats = item.daftar_kategori || [];
            const displayKats = allKats.slice(0, 2);
            const extraCount = allKats.length - 2;

            return (
              <div key={item.id} className="group/card bg-[#1a1d23] border border-white/5 rounded-[48px] p-3 hover:border-blue-500/40 hover:bg-[#1e2229] transition-all duration-500 shadow-xl flex flex-col">
                <div className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex flex-wrap gap-2 max-w-[180px]">
                      {displayKats.map((rel: any, idx: number) => (
                        <span key={idx} className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase border border-blue-500/20">
                          {rel.kategori.nama_kategori}
                        </span>
                      ))}
                      
                      {extraCount > 0 && (
                        <div className="relative group/popover">
                          <button className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-400 text-[9px] font-bold uppercase border border-white/10">
                            +{extraCount}
                          </button>
                          <div className="absolute bottom-full mb-3 left-0 w-48 bg-[#0f1115] border border-white/10 rounded-2xl p-3 shadow-2xl opacity-0 invisible group-hover/popover:opacity-100 group-hover/popover:visible transition-all duration-200 z-50">
                            <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">Kategori Lainnya</p>
                            <div className="flex flex-col gap-1.5">
                              {allKats.map((rel: any, idx: number) => (
                                <span key={idx} className="text-[10px] text-slate-300 font-medium">
                                  • {rel.kategori.nama_kategori}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Link href={`/edit/${item.id}`} className="bg-white/5 p-3 rounded-2xl text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all border border-white/5 uppercase">Edit</Link>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight italic group-hover/card:text-blue-400 transition-colors break-words leading-tight">
                    {item.nama}
                  </h3>

                  {/* TAMPILAN CATATAN - Diperkuat agar pasti tampil jika ada */}
                  {item.catatan ? (
                    <div className="mb-4">
                      <p className="text-[10px] text-slate-400 italic line-clamp-3 border-l-2 border-blue-500/50 pl-3 py-1 bg-white/[0.02] rounded-r-lg">
                        "{item.catatan}"
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4 h-[20px] opacity-0">-</div> 
                  )}

                  <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8 opacity-80 mt-auto">
                    <span className="text-blue-600 font-black text-xs">📍</span> {item.lokasi || "Gudang Utama"}
                  </div>

                  <div className="space-y-4">
                    <div className="bg-black/40 rounded-[32px] p-6 border border-white/5 shadow-inner text-center">
                      <p className="text-[10px] text-slate-600 font-black uppercase mb-1 tracking-[0.2em]">Kuantitas Stok</p>
                      <p className={`text-5xl font-black tabular-nums tracking-tighter ${item.jumlah < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {item.jumlah}
                      </p>
                    </div>

                    <DeleteButton 
                      id={Number(item.id)} 
                      action={softDeleteBarang} 
                      label="HAPUS DATA DARI GUDANG" 
                      className="w-full py-4 rounded-2xl bg-red-500/5 text-red-500/40 text-[9px] font-black hover:bg-red-600 hover:text-white transition-all uppercase tracking-[0.2em] border border-red-500/10 active:scale-95"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer className="mt-20 py-10 text-center border-t border-white/5">
          <p className="text-slate-700 text-[10px] font-black uppercase tracking-[1em] opacity-40">Widi Nugroho // 2026</p>
      </footer>
    </main>
  );
}