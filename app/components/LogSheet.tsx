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
    return <div className="text-[10px] text-red-500 italic">Failed to load telemetry logs...</div>;
  }

  return (
    <div className="mt-10 bg-white/5 rounded-[32px] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
      {/* Dekorasi Racing Line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-50"></div>
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Recent <span className="text-blue-500">Logistics</span> Movement
          </h3>
          <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Real-time Stock Telemetry</p>
        </div>
        <div className="h-px flex-1 bg-white/5 mx-4 mb-2"></div>
      </div>

      <div className="space-y-4">
        {logs && logs.length > 0 ? (
          logs.map((log: any) => (
            <div key={log.id} className="flex justify-between items-center group">
              <div className="flex flex-col">
                <span className="text-[12px] font-black text-white group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter">
                  {log.barang?.nama || "Unknown Unit"}
                </span>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-500 uppercase tracking-tighter">
                    {log.type}
                  </span>
                  <span className="text-[10px] text-slate-500 italic lowercase tracking-tight">
                    {log.reason || "No specification provided"}
                  </span>
                </div>
              </div>
              
              <div className={`text-sm font-black italic ${log.change_amount > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {log.change_amount > 0 ? "+" : ""}{log.change_amount}
                <span className="text-[8px] ml-1 opacity-50 uppercase">qty</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-[10px] text-slate-600 italic text-center py-4">
            No recent activity detected in the sector.
          </div>
        )}
      </div>

      {/* Timestamp footer */}
      <div className="mt-6 pt-4 border-t border-white/5 text-center">
        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">
          System Status: Operational // Secure Connection
        </span>
      </div>
    </div>
  );
}