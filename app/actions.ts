"use server"

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Simpan Barang Baru
export async function tambahBarang(formData: FormData) {
  // 1. Ambil data dari formulir
  const nama = formData.get("nama") as string;
  const jumlah = parseInt(formData.get("jumlah") as string);
  const lokasi = formData.get("lokasi") as string;
  const catatan = formData.get("catatan") as string; // Pastikan ini ada
  const kategoriIds = formData.getAll("kategori") as string[]; 

  // 2. Masukkan ke tabel 'barang'
  const { data: barangBaru, error: errorBarang } = await supabase
    .from("barang")
    .insert([
      { 
        nama, 
        jumlah, 
        lokasi, 
        catatan, // Kirim nilai catatan ke database
        is_deleted: false 
      },
    ])
    .select()
    .single();

  if (errorBarang) throw new Error(errorBarang.message);

  // 3. Masukkan relasi kategori jika ada
  if (kategoriIds.length > 0 && barangBaru) {
    const relasi = kategoriIds.map((katId) => ({
      barang_id: barangBaru.id,
      kategori_id: parseInt(katId),
    }));

    await supabase.from("barang_kategori").insert(relasi);
  }

  revalidatePath("/");
  redirect("/");
}

export async function updateBarang(formData: FormData) {
  // 1. Ambil data
  const id = formData.get("id") as string;
  const nama = formData.get("nama") as string;
  const jumlah = parseInt(formData.get("jumlah") as string);
  const lokasi = formData.get("lokasi") as string;
  const catatan = formData.get("catatan") as string; // Pastikan ini ada
  const kategoriIds = formData.getAll("kategori") as string[];

  // 2. Update tabel 'barang'
  const { error: errorBarang } = await supabase
    .from("barang")
    .update({ 
      nama, 
      jumlah, 
      lokasi, 
      catatan, // Update nilai catatan di database
      updated_at: new Date().toISOString() 
    })
    .eq("id", id);

  if (errorBarang) throw new Error(errorBarang.message);

  // 3. Sinkronisasi Kategori (Hapus lama, tambah baru)
  await supabase.from("barang_kategori").delete().eq("barang_id", id);
  
  if (kategoriIds.length > 0) {
    const relasi = kategoriIds.map((katId) => ({
      barang_id: parseInt(id),
      kategori_id: parseInt(katId),
    }));
    await supabase.from("barang_kategori").insert(relasi);
  }

  revalidatePath("/");
  redirect("/");
}

// PINDAH KE SAMPAH
export async function softDeleteBarang(id: number) {
  await supabase.from("barang").update({ is_deleted: true }).eq("id", id);
  revalidatePath("/");
}

// PULIHKAN
export async function restoreBarang(id: number) {
  await supabase
    .from("barang")
    .update({ is_deleted: false })
    .eq("id", id);
    
  revalidatePath("/");
  revalidatePath("/sampah");
}

// HAPUS PERMANEN
export async function hapusPermanen(id: number) {
  // 1. Hapus relasi di tabel junction dulu
  await supabase
    .from("barang_kategori")
    .delete()
    .eq("barang_id", id);

  // 2. Baru hapus barangnya secara permanen
  const { error } = await supabase
    .from("barang")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/sampah");
}

// --- ACTIONS KATEGORI ---

export async function tambahKategori(formData: FormData) {
  const nama = formData.get("nama_kategori");
  await supabase.from("kategori").insert([{ nama_kategori: nama }]);
  revalidatePath("/kategori");
}

export async function updateKategori(formData: FormData) {
  const id = formData.get("id");
  const nama = formData.get("nama_kategori");
  await supabase.from("kategori").update({ nama_kategori: nama }).eq("id", id);
  revalidatePath("/kategori");
}

export async function hapusKategori(id: number) {
  // Catatan: Jika ada barang yang pakai kategori ini, hapus akan gagal (Foreign Key Constraint)
  const { error } = await supabase.from("kategori").delete().eq("id", id);
  if (error) {
    console.error("Gagal hapus: Kategori masih digunakan oleh barang.");
  }
  revalidatePath("/kategori");
}