"use client";

import { useState, useTransition } from "react";

interface RestoreButtonProps {
  id: number;
  action: (id: number) => Promise<void> | void; 
  label: string;
  title?: string;
  confirmMsg?: string;
  className?: string;
}

export default function RestoreButton({ 
  id, 
  action, 
  label, 
  title = "Konfirmasi Restore",
  confirmMsg, 
  className 
}: RestoreButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pesan = confirmMsg || "Apakah Anda yakin ingin memulihkan data ini?";

  const handleOpenModal = () => {
    setErrorMessage(null);
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    if (isPending) return;
    setIsOpen(false);
    setErrorMessage(null);
  };

  const handleConfirmRestore = () => {
    setErrorMessage(null);
    
    startTransition(async () => {
      try {
        await action(id);
        setIsOpen(false);
      } catch (error) {
        console.error("Gagal memulihkan:", error);
        setErrorMessage("Gagal memulihkan data.");
      }
    });
  };

  return (
    <>
      <button onClick={handleOpenModal} className={className} type="button">
        {label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 w-full max-w-sm shadow-lg text-center">
            
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {title}
            </h3>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              {pesan}
            </p>

            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold text-center">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isPending}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Memulihkan..." : "Ya, Restore"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}