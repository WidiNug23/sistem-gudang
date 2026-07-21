import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Memastikan data selalu segar setiap halaman di-refresh

export default async function LogSheet() {
  // Mengambil data log stok terbaru, join dengan tabel barang untuk ambil nama
  const { data: logs, error } = await supabase
    .from("stock_logs")
    .select(`
      id,
      change_amount,
      type,
      reason,
      created_at,
      barang ( nama )
    `)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    console.error("Log error:", error);
    return <div className="text-xs text-red-500 italic p-4 text-center">Failed to load telemetry logs...</div>;
  }

  return (
    <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden font-sans">
      {/* Dekorasi Aksen Garis */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
      
      <div className="flex justify-between items-end mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Recent <span className="text-orange-600 dark:text-orange-400">Logistics</span> Movement
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Real-time Stock Telemetry</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {logs && logs.length > 0 ? (
          logs.map((log: any) => (
            <div key={log.id} className="flex justify-between items-center group bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex flex-col space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                  {log.barang?.nama || "Unknown Unit"}
                </span>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase border border-slate-200 dark:border-slate-800">
                    {log.type}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                    {log.reason || "No specification provided"}
                  </span>
                </div>
              </div>
              
              <div className={`text-sm font-bold ${log.change_amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {log.change_amount > 0 ? "+" : ""}{log.change_amount}
                <span className="text-[10px] ml-1 opacity-70 uppercase">qty</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-xs text-slate-400 italic text-center py-8">
            No recent activity detected in the sector.
          </div>
        )}
      </div>

      {/* Timestamp footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          System Status: Operational // Secure Connection
        </span>
      </div>
    </div>
  );
}