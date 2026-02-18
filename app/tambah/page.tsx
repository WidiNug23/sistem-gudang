import { tambahBarang } from "../actions";

export default function TambahPage() {
  return (
    <main className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Tambah Barang Baru</h1>
      <form action={tambahBarang} className="space-y-4">
        <div>
          <label className="block">Nama Barang</label>
          <input name="nama" className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block">Jumlah Stok</label>
          <input name="jumlah" type="number" className="w-full border p-2 rounded" required />
        </div>
        <div>
          <label className="block">Lokasi Rak</label>
          <input name="lokasi" className="w-full border p-2 rounded" placeholder="Contoh: Rak A-1" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Simpan</button>
          <a href="/" className="bg-gray-500 text-white px-4 py-2 rounded">Batal</a>
        </div>
      </form>
    </main>
  );
}