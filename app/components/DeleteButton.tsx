"use client";

interface DeleteButtonProps {
  id: number;
  // Kita buat action fleksibel agar bisa menerima server action langsung 
  // atau fungsi custom (id) => Promise<void>
  action: (id: number) => Promise<void> | void; 
  label: string;
  confirmMsg?: string; // Tambahkan opsional agar tidak error
  className?: string;
}

export default function DeleteButton({ id, action, label, confirmMsg, className }: DeleteButtonProps) {
  const handleDelete = async () => {
    const pesan = confirmMsg || "Apakah Anda yakin ingin menghapus data ini?";
    
    if (confirm(pesan)) {
      try {
        await action(id);
      } catch (error) {
        console.error("Gagal menghapus:", error);
        alert("Gagal menghapus data. Kategori mungkin masih digunakan oleh barang.");
      }
    }
  };

  return (
    <button onClick={handleDelete} className={className} type="button">
      {label}
    </button>
  );
}