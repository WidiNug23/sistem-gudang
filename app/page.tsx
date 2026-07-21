import { supabase } from "@/lib/supabase";
import { softDeleteBarang } from "./actions";
import Link from "next/link";
import DeleteButton from "./components/DeleteButton";
import SortDropdown from "./components/SortDropdown";
import AdjustmentButton from "./components/AdjustmentButton";

export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; urutan?: string; cari?: string; view?: string }>;
}) {
  const filters = await searchParams;
  const filterKategori = filters.kategori;
  const urutan = filters.urutan || "terbaru";
  const kataKunci = filters.cari || "";
  const viewMode = filters.view || "tabel";

  const { data: listKategori } = await supabase
    .from("kategori")
    .select("id, nama_kategori")
    .order("nama_kategori", { ascending: true });

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
  };

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams();
    if (filterKategori) params.set("kategori", filterKategori);
    if (urutan) params.set("urutan", urutan);
    if (kataKunci) params.set("cari", kataKunci);
    params.set(name, value);
    return `?${params.toString()}`;
  };

  return (
    <div className="p-4 md:p-8 font-sans w-full">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Manajemen Gudang
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Kelola stok barang di gudang dengan mudah.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <form className="relative flex items-center flex-1 md:min-w-[300px]">
            <input 
              name="cari"
              defaultValue={kataKunci}
              placeholder="Cari nama barang..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-2.5 pl-4 pr-10 rounded-xl text-sm outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm"
            />
            <input type="hidden" name="urutan" value={urutan} />
            <input type="hidden" name="kategori" value={filterKategori || "semua"} />
            <input type="hidden" name="view" value={viewMode} />
            <button type="submit" className="absolute right-2 text-slate-400 hover:text-blue-600 p-1.5 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            <Link href="/produksi" className="px-3.5 py-2.5 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 hover:bg-orange-100 transition-all text-xs font-semibold">Produksi</Link>
            <Link href="/kategori" className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-semibold">Kategori</Link>
            <Link href="/sampah" className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-semibold">Sampah</Link>
            <Link href="/tambah" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-sm text-xs">+ Tambah Barang</Link>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col gap-2 flex-1 min-w-[280px]">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kategori</span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <Link 
              href={createQueryString("kategori", "semua")} 
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${!filterKategori || filterKategori === 'semua' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              Semua
            </Link>
            {listKategori?.map((kat) => (
              <Link 
                key={kat.id}
                href={createQueryString("kategori", String(kat.id))}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filterKategori === String(kat.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                {kat.nama_kategori}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col gap-2 w-full md:w-64">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Urutkan</span>
          <SortDropdown currentUrutan={urutan} currentKategori={filterKategori} options={sortLabels} />
        </div>
      </div>

      {/* Content Header & View Mode Switcher */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Daftar Barang</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
            {barang?.length || 0}
          </span>
        </div>

        <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl">
          <Link
            href={createQueryString("view", "tabel")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${viewMode === "tabel" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
          >
            Tabel
          </Link>
          <Link
            href={createQueryString("view", "card")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${viewMode === "card" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"}`}
          >
            Kartu
          </Link>
        </div>
      </div>

      {/* Main Container */}
      {barang?.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
          <p className="text-slate-400 text-sm font-medium">Tidak ada data barang ditemukan.</p>
        </div>
      ) : viewMode === "tabel" ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-900/80">
                  <th className="py-3.5 px-5">Nama Barang</th>
                  <th className="py-3.5 px-5">Kategori</th>
                  <th className="py-3.5 px-5">Lokasi</th>
                  <th className="py-3.5 px-5 text-center">Stok</th>
                  <th className="py-3.5 px-5">Catatan</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {barang?.map((item) => {
                  const allKats = item.daftar_kategori || [];
                  const displayKats = allKats.slice(0, 2);
                  const extraCount = allKats.length - 2;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                        {item.nama}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex flex-wrap gap-1">
                          {displayKats.map((rel: any, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                              {rel.kategori.nama_kategori}
                            </span>
                          ))}
                          {extraCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px]">+{extraCount}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400">
                        {item.lokasi || "Gudang Utama"}
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md font-bold ${item.jumlah < 5 ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                          {item.jumlah}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {item.catatan || "-"}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <AdjustmentButton id={Number(item.id)} nama={item.nama} />
                          <Link href={`/edit/${item.id}`} className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-all text-[11px]">
                            Edit
                          </Link>
                          <DeleteButton 
                            id={Number(item.id)} 
                            action={softDeleteBarang} 
                            label="Hapus" 
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 font-medium transition-all text-[11px]"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {barang?.map((item) => {
            const allKats = item.daftar_kategori || [];
            const displayKats = allKats.slice(0, 2);
            const extraCount = allKats.length - 2;

            return (
              <div key={item.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex flex-wrap gap-1">
                      {displayKats.map((rel: any, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium">
                          {rel.kategori.nama_kategori}
                        </span>
                      ))}
                      {extraCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px]">+{extraCount}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <AdjustmentButton id={Number(item.id)} nama={item.nama} />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                    {item.nama}
                  </h3>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    📍 {item.lokasi || "Gudang Utama"}
                  </p>

                  {item.catatan && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg mb-4">
                      "{item.catatan}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Stok</span>
                    <span className={`text-lg font-bold ${item.jumlah < 5 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                      {item.jumlah}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link href={`/edit/${item.id}`} className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">Edit</Link>
                    <DeleteButton 
                      id={Number(item.id)} 
                      action={softDeleteBarang} 
                      label="Hapus" 
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}