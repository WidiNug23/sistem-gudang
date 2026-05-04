"use client";

import { useState, useTransition } from "react";
import { adjustStok } from "../actions";

interface AdjustmentProps {
  id: number;
  nama: string;
}

export default function AdjustmentButton({ id, nama }: AdjustmentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Handler untuk submit form agar modal tertutup setelah sukses
  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await adjustStok(formData);
        setIsOpen(false);
      } catch (error) {
        alert("Gagal mengubah stok. Silakan coba lagi.");
        console.error(error);
      }
    });
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-[9px] font-black text-orange-500 hover:text-orange-400 uppercase tracking-tighter transition-colors"
      >
        ± Adjust
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1d23] border border-white/10 p-8 rounded-[32px] w-full max-w-sm shadow-2xl shadow-orange-500/10">
            <header className="mb-6">
              <h2 className="text-white font-black italic uppercase text-xl leading-none">
                Stock Adjustment
              </h2>
              <p className="text-orange-500 font-bold text-xs uppercase mt-1">{nama}</p>
            </header>

            <form action={handleSubmit} className="space-y-4">
              {/* ID Barang */}
              <input type="hidden" name="id" value={id} />
              
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Jumlah Perubahan</label>
                <input 
                  type="number" 
                  name="amount" 
                  placeholder="Contoh: 10 atau -5" 
                  className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white font-bold outline-none focus:border-orange-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Alasan Penyesuaian</label>
                <textarea 
                  name="reason" 
                  placeholder="Misal: Barang rusak atau salah input" 
                  className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-white text-sm outline-none h-28 resize-none focus:border-orange-500 transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  disabled={isPending}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 py-4 rounded-2xl font-black uppercase text-[10px] transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-orange-600/20 transition-all disabled:opacity-50"
                >
                  {isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}