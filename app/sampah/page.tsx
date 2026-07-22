import { supabase } from "@/lib/supabase";
import { restoreBarang, hapusPermanen } from "../actions";
import Link from "next/link";
import DeleteButton from "../components/DeleteButton";
import RestoreButton from "../components/RestoreButton"; // Komponen baru untuk konfirmasi restore

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
    <div className="p-4 md:p-8 w-full font-sans max-w-6xl mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link 
            href="/" 
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
            title="Kembali ke Beranda"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Sampah
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold tracking-wider uppercase mt-0.5">
              Total Sampah: {sampah?.length || 0} Unit
            </p>
          </div>
        </div>
      </div>

      {/* LIST SECTION / TABLE LAYOUT */}
      {!sampah || sampah.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Tidak ada data di tempat pembuangan.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/80">
                  <th className="py-3.5 px-5">Nama Barang</th>
                  <th className="py-3.5 px-5">Kategori</th>
                  <th className="py-3.5 px-5">Lokasi</th>
                  <th className="py-3.5 px-5 text-center">Stok</th>
                  <th className="py-3.5 px-5">Catatan</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {sampah.map((item) => {
                  const allKats = item.daftar_kategori || [];
                  const displayKats = allKats.slice(0, 2);
                  const extraCount = allKats.length - 2;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Nama Barang */}
                      <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white tracking-wide">
                        {item.nama}
                      </td>

                      {/* Kategori */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-wrap gap-1">
                          {displayKats.map((rel: any, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                              {rel.kategori?.nama_kategori}
                            </span>
                          ))}
                          {extraCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-bold">
                              +{extraCount}
                            </span>
                          )}
                          {allKats.length === 0 && (
                            <span className="text-slate-400 font-medium">-</span>
                          )}
                        </div>
                      </td>

                      {/* Lokasi */}
                      <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
                        {item.lokasi || "Gudang Utama"}
                      </td>

                      {/* Stok */}
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-md font-black tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {item.jumlah}
                        </span>
                      </td>

                      {/* Catatan */}
                      <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 max-w-xs truncate font-medium">
                        {item.catatan || "-"}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          <RestoreButton 
                            id={Number(item.id)}
                            action={restoreBarang}
                            label="Restore"
                            title="Konfirmasi Restore"
                            confirmMsg={`Apakah Anda yakin ingin memulihkan data "${item.nama}" kembali ke daftar barang aktif?`}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-400 font-bold transition-all text-[11px] uppercase tracking-wider cursor-pointer"
                          />

                          <DeleteButton 
                            id={Number(item.id)} 
                            itemName={item.nama}
                            action={hapusPermanen} 
                            label="Destroy" 
                            confirmMsg={`Data "${item.nama}" akan dihapus permanen dan tidak dapat dikembalikan.`} 
                            requireNameMatch={true}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 font-bold transition-all text-[11px] uppercase tracking-wider cursor-pointer"
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
      )}

    </div>
  );
}