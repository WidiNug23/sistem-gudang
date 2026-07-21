"use client";

import { supabase } from "@/lib/supabase";
import { submitProduksi, saveResep, hapusResepBOM } from "../actions";
import Link from "next/link";
import { useEffect, useState } from "react";

interface BOMItem {
  id: number;
  quantity_produced: number;
  quantity_required: number;
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
  const [newMultiplier, setNewMultiplier] = useState("1");
  const [newWaste, setNewWaste] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");

  // State untuk Execution Engine
  const [selectedBomId, setSelectedBomId] = useState("");
  const [rawUsageQty, setRawUsageQty] = useState("1");

  useEffect(() => {
    async function fetchData() {
      const { data: b } = await supabase.from("barang").select("id, nama").eq("is_deleted", false);
      const { data: br } = await supabase.from("bom").select(`
          id, quantity_produced, quantity_required, parent_id, child_id,
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

  const handleRecipeChange = (bomId: string) => {
    setSelectedBomId(bomId);
    const found = bomList.find(b => b.id === Number(bomId));
    if (found) {
      setRawUsageQty((found.quantity_required ?? 1).toString());
    } else {
      setRawUsageQty("1");
    }
  };

  const openCorrection = (log: any) => {
    setSelectedLog(log);
    setNewQty(Math.abs(log.change_amount).toString());
    setNewMultiplier("1");
    setNewWaste("0");
    setSelectedParentId(log.barang_id.toString());
    setIsModalOpen(true);
  };

  const handleKoreksiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog || !newQty || !selectedParentId) return;

    const matchingRecipe = bomList.find(b => b.parent_id === Number(selectedParentId));

    const formData = new FormData();
    formData.append("parentId", selectedParentId);
    formData.append("childId", matchingRecipe ? matchingRecipe.child_id.toString() : "");
    formData.append("qty", newMultiplier || "1"); 
    formData.append("rawUsageQty", newQty); 
    formData.append("batchId", selectedLog.reference_id);
    formData.append("waste", newWaste || "0");
    if (matchingRecipe) {
      formData.append("bomId", matchingRecipe.id.toString());
    }

    try {
      setLoading(true);
      await submitProduksi(formData);
      window.location.reload();
    } catch (err: any) {
      alert("Gagal koreksi: " + err.message);
      setLoading(false);
    }
  };

  const selectedRecipe = bomList.find(b => b.id === Number(selectedBomId));

  if (loading && !isModalOpen) {
    return (
      <div className="p-8 text-orange-500 font-bold animate-pulse text-center">
        MEMUAT SISTEM PRODUKSI...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-all shadow-sm"
              title="Kembali ke Beranda"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 group-hover:text-orange-600 dark:group-hover:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Production Control
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
                Audit Trail & Correction System
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* PANEL 1: SETUP RESEP */}
          <section className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              1. Konfigurasi Resep
            </h2>
            <form action={async (fd) => { await saveResep(fd); window.location.reload(); }} className="space-y-3">
              <select 
                name="pId" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all cursor-pointer shadow-sm" 
                required
              >
                <option value="">Pilih Bahan Baku...</option>
                {barang?.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
              </select>
              <select 
                name="cId" 
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all cursor-pointer shadow-sm" 
                required
              >
                <option value="">Pilih Hasil Produksi...</option>
                {barang?.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  name="qtyReq" 
                  type="number" 
                  step="any" 
                  placeholder="Qty Bahan Baku" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all shadow-sm placeholder:text-slate-400" 
                  required 
                />
                <input 
                  name="qty" 
                  type="number" 
                  step="any" 
                  placeholder="Qty Hasil Output" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all shadow-sm placeholder:text-slate-400" 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-orange-600 dark:hover:text-orange-400 py-3 rounded-xl text-xs font-semibold transition-all mt-2 shadow-sm"
              >
                Simpan Resep
              </button>
            </form>

            <div className="mt-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                Resep Aktif
              </p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {bomList.map((res) => (
                  <div key={res.id} className="group p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl flex justify-between items-center hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-slate-500 font-medium leading-none mb-1">
                        {res.parent?.nama} ({res.quantity_required ?? 1} unit)
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        ➔ {res.child?.nama}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-md text-[11px] font-bold border border-orange-200 dark:border-orange-900/50">
                        x{res.quantity_produced}
                      </div>
                      <button 
                        onClick={async () => { if(confirm('Hapus resep?')) { await hapusResepBOM(res.id); window.location.reload(); }}} 
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Hapus Resep"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* PANEL 2: EKSEKUSI ENGINE */}
          <section className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-orange-500/30 shadow-sm relative">
            <h2 className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-6">
              2. Execution Engine
            </h2>
            <form action={async (fd) => { await submitProduksi(fd); window.location.reload(); }} className="space-y-4">
              
              <input type="hidden" name="bomId" value={selectedBomId} />
              <input type="hidden" name="parentId" value={selectedRecipe ? selectedRecipe.parent_id : ""} />
              <input type="hidden" name="childId" value={selectedRecipe ? selectedRecipe.child_id : ""} />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pilih Resep / Proses</label>
                <select 
                  value={selectedBomId}
                  onChange={(e) => handleRecipeChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all cursor-pointer shadow-sm" 
                  required
                >
                  <option value="">Pilih resep aktif...</option>
                  {bomList.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.parent?.nama} ➔ {b.child?.nama} (Yield: x{b.quantity_produced})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target Output</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedRecipe ? selectedRecipe.child?.nama : <span className="text-slate-400 italic font-normal">-- Pilih resep dahulu --</span>}
                  </p>
                </div>
                {selectedRecipe && (
                  <div className="text-right">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Base Yield</p>
                    <span className="inline-block bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-xs font-bold px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-900/50 mt-0.5">
                      x{selectedRecipe.quantity_produced}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">Bahan Digunakan</label>
                  <input 
                    name="rawUsageQty" 
                    type="number" 
                    step="any" 
                    min="0.1" 
                    value={rawUsageQty}
                    onChange={(e) => setRawUsageQty(e.target.value)}
                    placeholder="1" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm font-bold text-orange-600 dark:text-orange-400 outline-none focus:border-orange-500 shadow-sm" 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Multiplier</label>
                  <input 
                    name="qty" 
                    type="number" 
                    step="any" 
                    min="0.1" 
                    defaultValue="1" 
                    placeholder="1" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 shadow-sm" 
                    required 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-red-600 dark:text-red-400">Waste</label>
                  <input 
                    name="waste" 
                    type="number" 
                    step="any" 
                    placeholder="0" 
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-red-200 dark:border-red-950/60 p-3 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 outline-none focus:border-red-500 shadow-sm" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="group w-full bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
              >
                <span>Mulai Produksi</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>
          </section>

          {/* PANEL 3: AUDIT TRAIL */}
          <section className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[560px]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-6 shrink-0">
              3. Riwayat & Audit Trail
            </h2>
            <div className="space-y-3 overflow-y-auto pr-2 flex-1 [scrollbar-width:thin] [scrollbar-color:rgba(156,163,175,0.4)_transparent] hover:[scrollbar-color:rgba(156,163,175,0.7)_transparent]">
              {logs.map((log: any) => (
                <div key={log.id} className="group p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate pr-2">
                      {log.barang?.nama}
                    </p>
                    <span className={`text-xs font-bold ${log.change_amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mb-2.5">
                    "{log.reason}"
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                        log.type === 'WASTE' ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : 
                        log.type === 'ADJUSTMENT' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' : 
                        'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {log.type === 'PRODUKSI_OUT' && log.reference_id && (
                      <button 
                        onClick={() => openCorrection(log)}
                        className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:text-orange-700 border border-orange-200 dark:border-orange-900/50 px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/30 transition-all uppercase"
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
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mode Koreksi</h3>
              </div>
              
              <form onSubmit={handleKoreksiSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Referensi Item</label>
                  <select 
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all cursor-pointer shadow-sm"
                    required
                  >
                    {bomList.map(b => (
                      <option key={b.id} value={b.parent_id}>{b.parent?.nama} ➔ {b.child?.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">Qty Bahan Baru</label>
                    <input 
                      type="number" 
                      step="any"
                      value={newQty}
                      onChange={(e) => setNewQty(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-sm font-bold text-orange-600 dark:text-orange-400 outline-none focus:border-orange-500 shadow-sm"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Multiplier</label>
                    <input 
                      type="number" 
                      step="any"
                      min="0.1"
                      value={newMultiplier}
                      onChange={(e) => setNewMultiplier(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-orange-500 shadow-sm"
                      placeholder="1"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-red-600 dark:text-red-400">Waste Baru</label>
                    <input 
                      type="number"
                      step="any"
                      value={newWaste}
                      onChange={(e) => setNewWaste(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-red-200 dark:border-red-950/60 p-3.5 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 outline-none focus:border-red-500 shadow-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}