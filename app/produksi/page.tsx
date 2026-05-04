import { supabase } from "@/lib/supabase";
import { submitProduksi, saveResep } from "../actions";
import Link from "next/link";

interface BOMItem {
  id: number;
  quantity_produced: number;
  parent_id: number;
  child_id: number;
  parent: { nama: string } | null;
  child: { nama: string } | null;
}

export default async function ProduksiPage() {
  const { data: barang } = await supabase
    .from("barang")
    .select("id, nama")
    .eq("is_deleted", false);

  const { data: bomRaw } = await supabase
    .from("bom")
    .select(`
      id, 
      quantity_produced,
      parent_id,
      child_id,
      parent:barang!parent_id(nama),
      child:barang!child_id(nama)
    `);

  const bomList = (bomRaw as unknown as BOMItem[]) || [];

  const { data: logs } = await supabase
    .from("stock_logs")
    .select(`
      id,
      change_amount,
      created_at,
      type,
      barang(nama)
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="p-4 md:p-8 bg-[#0f1115] min-h-screen text-white font-sans selection:bg-orange-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500 hover:border-orange-500 transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-orange-500 leading-none">
                Production Control
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                Manufacturing Execution System v1.0
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PANEL 1: SETUP RESEP */}
          <section className="lg:col-span-4 bg-[#1a1d23] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1.5 h-4 bg-slate-500 rounded-full" />
              <h2 className="text-sm font-black uppercase text-slate-400 italic">1. Recipe Configuration</h2>
            </div>
            
            <form action={saveResep} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Input Material</label>
                <select name="pId" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold outline-none focus:border-orange-500 transition-all cursor-pointer" required>
                  <option value="">Select Raw Material...</option>
                  {barang?.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Output Product</label>
                <select name="cId" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold outline-none focus:border-orange-500 transition-all cursor-pointer" required>
                  <option value="">Select Result...</option>
                  {barang?.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Yield Quantity</label>
                <input name="qty" type="number" placeholder="0" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold outline-none focus:border-orange-500 transition-all" required />
              </div>
              <button type="submit" className="w-full bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/50 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-2">
                Register Recipe
              </button>
            </form>

            <div className="mt-8">
              <p className="text-[9px] font-black text-slate-500 uppercase mb-3 px-1">Active Recipes</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {bomList.length > 0 ? bomList.map((res) => (
                  <div key={res.id} className="group p-3 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center hover:border-white/20 transition-all">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-bold uppercase leading-none mb-1">{res.parent?.nama || "???"}</span>
                      <span className="text-[11px] font-black uppercase">➔ {res.child?.nama || "???"}</span>
                    </div>
                    <div className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded-md text-[10px] font-black">
                      x{res.quantity_produced}
                    </div>
                  </div>
                )) : (
                  <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
                    <p className="text-[10px] text-slate-600 italic font-bold uppercase tracking-tight">Empty Database</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* PANEL 2: EKSEKUSI */}
          <section className="lg:col-span-4 bg-[#1a1d23] p-6 rounded-[2rem] border border-orange-500/30 shadow-[0_0_50px_-12px_rgba(249,115,22,0.15)] relative overflow-hidden">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
              <h2 className="text-sm font-black uppercase text-orange-500 italic">2. Execution Engine</h2>
            </div>
            
            <form action={submitProduksi} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Process Subject</label>
                  <select name="parentId" className="w-full bg-black/60 border border-white/10 p-4 rounded-2xl text-sm font-black outline-none focus:border-orange-500 transition-all appearance-none" required>
                    <option value="">Choose material to process...</option>
                    {/* Filter unik berdasarkan parent_id yang ada di BOM */}
                    {Array.from(new Set(bomList.map(b => b.parent_id))).map(pid => {
                      const label = bomList.find(b => b.parent_id === pid)?.parent?.nama;
                      return <option key={pid} value={pid}>{label}</option>
                    })}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Production Volume (Cycles)</label>
                  <input name="qty" type="number" min="1" placeholder="Enter cycle count..." className="w-full bg-black/60 border border-white/10 p-5 rounded-2xl text-2xl font-black outline-none focus:border-orange-500 transition-all text-orange-500 placeholder:text-slate-800" required />
                </div>
              </div>

              <button type="submit" className="group w-full bg-orange-600 hover:bg-orange-500 p-5 rounded-2xl font-black uppercase text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                <span>Start Production</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </section>

          {/* PANEL 3: STATUS PROGRES */}
          <section className="lg:col-span-4 bg-[#1a1d23] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                <h2 className="text-sm font-black uppercase text-blue-400 italic">3. Live Activity</h2>
              </div>
            </div>

            <div className="space-y-3">
              {logs && logs.length > 0 ? logs.map((log: any) => (
                <div key={log.id} className="group flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/0 hover:border-white/5 transition-all">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs ${log.change_amount > 0 ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                    {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black uppercase truncate leading-none mb-1">{log.barang?.nama || "Deleted Item"}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{log.type}</span>
                       <span className="w-1 h-1 bg-slate-800 rounded-full" />
                       <span className="text-[8px] text-slate-500 font-bold uppercase" suppressHydrationWarning>
                         {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center">
                  <p className="text-[10px] text-slate-700 font-bold uppercase italic">No recent logs available</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}