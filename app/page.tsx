import { supabase } from "@/lib/supabase";
import { hapusBarang } from "./actions";
import Link from "next/link";

export default async function Home() {
  const { data: barang } = await supabase.from("barang").select("*").order("id");

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Data Stok Gudang</h1>
        <Link href="/tambah" className="bg-blue-500 text-white px-4 py-2 rounded">
          + Tambah Barang
        </Link>
      </div>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Nama Barang</th>
            <th className="border p-2">Jumlah</th>
            <th className="border p-2">Lokasi</th>
            <th className="border p-2">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {barang?.map((item) => (
            <tr key={item.id} className="text-center">
              <td className="border p-2">{item.nama}</td>
              <td className="border p-2">{item.jumlah}</td>
              <td className="border p-2">{item.lokasi}</td>
              <td className="border p-2">
                {/* Form untuk hapus menggunakan Server Action */}
                <form action={async () => { "use server"; await hapusBarang(item.id); }}>
                   <button className="text-red-500 hover:underline">Hapus</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}