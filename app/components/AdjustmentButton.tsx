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
        className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 uppercase tracking-wider transition-colors cursor-pointer"
      >
        ± Adjust
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-sans">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl w-full max-w-sm shadow-xl">
            <header className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-slate-900 dark:text-white font-extrabold uppercase text-lg tracking-tight">
                Stock Adjustment
              </h2>
              <p className="text-orange-600 dark:text-orange-400 font-bold text-xs uppercase mt-1 truncate">{nama}</p>
            </header>

            <form action={handleSubmit} className="space-y-4">
              {/* ID Barang */}
              <input type="hidden" name="id" value={id} />
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Jumlah Perubahan</label>
                <input 
                  type="number" 
                  name="amount" 
                  placeholder="Contoh: 10 atau -5" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-all shadow-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Alasan Penyesuaian</label>
                <textarea 
                  name="reason" 
                  placeholder="Misal: Barang rusak atau salah input" 
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-none h-24 resize-none focus:border-orange-500 transition-all shadow-sm"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  disabled={isPending}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-3.5 rounded-xl font-bold uppercase text-xs transition-all disabled:opacity-50 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-bold uppercase text-xs transition-all disabled:opacity-50 shadow-sm cursor-pointer"
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