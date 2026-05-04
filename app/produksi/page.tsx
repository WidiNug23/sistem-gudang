"use client"

import { supabase } from "@/lib/supabase";
import { submitProduksi, saveResep, hapusResepBOM } from "../actions";
import Link from "next/link";
import { useEffect, useState } from "react";

interface BOMItem {
  id: number;
  quantity_produced: number;
  parent_id: number;
  child_id: number;
  parent: { nama: string } | null;
  child: { nama: string } | null;
}

export default function ProduksiPage() {
  const [barang, setBarang] = useState<any[]>([]);
  const [bomList, setBomList] = useState<BOMItem[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State untuk Modal Koreksi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [newQty, setNewQty] = useState("");
  const [newWaste, setNewWaste] = useState(""); // State baru untuk Waste
  const [selectedParentId, setSelectedParentId] = useState("");

  useEffect(() => {
    async function fetchData() {
      const { data: b } = await supabase.from("barang").select("id, nama").eq("is_deleted", false);
      const { data: br } = await supabase.from("bom").select(`
          id, quantity_produced, parent_id, child_id,
          parent:barang!parent_id(nama),
          child:barang!child_id(nama)
        `);
      const { data: lg } = await supabase.from("stock_logs").select(`
          id, change_amount, created_at, type, reason, reference_id, barang_id,
          barang(nama)
        `).order("created_at", { ascending: false }).limit(15);

      setBarang(b || []);
      setBomList((br as unknown as BOMItem[]) || []);
      setLogs(lg || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const openCorrection = (log: any) => {
    setSelectedLog(log);
    setNewQty(Math.abs(log.change_amount).toString());
    setNewWaste("0"); // Default waste saat buka modal
    setSelectedParentId(log.barang_id.toString());
    setIsModalOpen(true);
  };

  const handleKoreksiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog || !newQty || !selectedParentId) return;

    const formData = new FormData();
    formData.append("parentId", selectedParentId);
    formData.append("qty", newQty);
    formData.append("batchId", selectedLog.reference_id);
    formData.append("waste", newWaste || "0"); // Mengirim nilai waste baru

    try {
      setLoading(true);
      await submitProduksi(formData);
      window.location.reload();
    } catch (err: any) {
      alert("Gagal koreksi: " + err.message);
      setLoading(false);
    }
  };

  const materialsWithRecipe = Array.from(new Set(bomList.map(b => b.parent_id))).map(pid => {
    return { id: pid, nama: bomList.find(b => b.parent_id === pid)?.parent?.nama };
  });

  if (loading && !isModalOpen) return <div className="p-8 text-orange-500 font-black animate-pulse">LOADING SYSTEM...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#0f1115] min-h-screen text-white font-sans selection:bg-orange-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-orange-500 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-orange-500 leading-none">Production Control</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Audit Trail & Correction System</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PANEL 1: SETUP RESEP */}
          <section className="lg:col-span-4 bg-[#1a1d23] p-6 rounded-[2rem] border border-white/5 shadow-2xl">
            <h2 className="text-sm font-black uppercase text-slate-400 italic mb-6">1. Recipe Configuration</h2>
            <form action={async (fd) => { await saveResep(fd); window.location.reload(); }} className="space-y-3">
              <select name="pId" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold outline-none focus:border-orange-500 transition-all cursor-pointer" required>
                <option value="">Select Raw Material...</option>
                {barang?.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
              </select>
              <select name="cId" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold outline-none focus:border-orange-500 transition-all cursor-pointer" required>
                <option value="">Select Result...</option>
                {barang?.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
              </select>
              <input name="qty" type="number" placeholder="Yield Quantity" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs font-bold outline-none focus:border-orange-500 transition-all" required />
              <button type="submit" className="w-full bg-white/5 hover:bg-orange-500/10 border border-white/10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mt-2">Register Recipe</button>
            </form>

            <div className="mt-8">
              <p className="text-[9px] font-black text-slate-500 uppercase mb-3 px-1">Active Recipes</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {bomList.map((res) => (
                  <div key={res.id} className="group p-3 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center hover:border-white/20 transition-all">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-500 font-bold uppercase leading-none mb-1">{res.parent?.nama}</span>
                      <span className="text-[11px] font-black uppercase">➔ {res.child?.nama}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded-md text-[10px] font-black">x{res.quantity_produced}</div>
                      <button onClick={async () => { if(confirm('Hapus resep?')) { await hapusResepBOM(res.id); window.location.reload(); }}} className="text-slate-600 hover:text-red-500 transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PANEL 2: EKSEKUSI ENGINE */}
          <section className="lg:col-span-4 bg-[#1a1d23] p-6 rounded-[2rem] border border-orange-500/30 shadow-[0_0_50px_-12px_rgba(249,115,22,0.15)] relative">
            <h2 className="text-sm font-black uppercase text-orange-500 italic mb-8">2. Execution Engine</h2>
            <form action={async (fd) => { await submitProduksi(fd); window.location.reload(); }} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Process Subject</label>
                <select name="parentId" className="w-full bg-black/60 border border-white/10 p-4 rounded-2xl text-sm font-black outline-none focus:border-orange-500 transition-all appearance-none" required>
                  <option value="">Choose material...</option>
                  {materialsWithRecipe.map(m => (
                    <option key={m.id} value={m.id}>{m.nama}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Qty (Cycles)</label>
                  <input name="qty" type="number" min="1" placeholder="0" className="w-full bg-black/60 border border-white/10 p-4 rounded-2xl text-xl font-black outline-none focus:border-orange-500 text-orange-500" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-red-500 uppercase ml-1">Waste (Loss)</label>
                  <input name="waste" type="number" step="0.1" placeholder="0" className="w-full bg-black/60 border border-red-500/20 p-4 rounded-2xl text-xl font-black outline-none focus:border-red-500 text-red-400" />
                </div>
              </div>
              <button type="submit" className="group w-full bg-orange-600 hover:bg-orange-500 p-5 rounded-2xl font-black uppercase text-sm transition-all flex items-center justify-center gap-3">
                <span>Start Production</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </form>
          </section>

          {/* PANEL 3: AUDIT TRAIL */}
          <section className="lg:col-span-4 bg-[#1a1d23] p-6 rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
            <h2 className="text-sm font-black uppercase text-blue-400 italic mb-6">3. History & Audit Trail</h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-hide">
              {logs.map((log: any) => (
                <div key={log.id} className="group p-4 bg-black/40 rounded-2xl border border-white/0 hover:border-white/5 transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[11px] font-black uppercase truncate text-slate-300">{log.barang?.nama}</p>
                    <span className={`text-[11px] font-black ${log.change_amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold italic mb-2 leading-tight">"{log.reason}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                        log.type === 'WASTE' ? 'bg-red-500/20 text-red-400' : 
                        log.type === 'ADJUSTMENT' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'
                      }`}>{log.type}</span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {log.type === 'PRODUKSI_OUT' && log.reference_id && (
                      <button 
                        onClick={() => openCorrection(log)}
                        className="text-[8px] font-black text-orange-500 hover:text-white border border-orange-500/30 px-2 py-1 rounded bg-orange-500/5 hover:bg-orange-500 transition-all uppercase"
                      >
                        Koreksi
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* CUSTOM MODAL KOREKSI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-[#1a1d23] border border-orange-500/30 rounded-[2.5rem] shadow-[0_0_80px_-20px_rgba(249,115,22,0.3)] overflow-hidden">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Correction Mode</h3>
              </div>
              
              <form onSubmit={handleKoreksiSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Item Reference</label>
                  <select 
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-sm font-bold outline-none focus:border-orange-500 text-white transition-all appearance-none cursor-pointer"
                    required
                  >
                    {materialsWithRecipe.map(m => (
                      <option key={m.id} value={m.id}>{m.nama}</option>
                    ))}
                  </select>
                </div>

                {/* Grid Input untuk Qty dan Waste */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-1">New Qty</label>
                    <input 
                      type="number" 
                      value={newQty}
                      onChange={(e) => setNewQty(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 p-5 rounded-2xl text-xl font-black outline-none focus:border-orange-500 text-orange-500 transition-all"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-1">New Waste</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={newWaste}
                      onChange={(e) => setNewWaste(e.target.value)}
                      className="w-full bg-black/50 border border-red-500/20 p-5 rounded-2xl text-xl font-black outline-none focus:border-red-500 text-red-400 transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all text-slate-400"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-orange-600 hover:bg-orange-500 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-900/40 transition-all"
                  >
                    Commit Change
                  </button>
                </div>
              </form>
            </div>
            
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>
          </div>
        </div>
      )}
    </div>
  );
}