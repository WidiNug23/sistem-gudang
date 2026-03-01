"use server"

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Simpan Barang Baru
export async function tambahBarang(formData: FormData) {
  const { error } = await supabase.from("barang").insert([{ 
    nama: formData.get("nama"), 
    jumlah: parseInt(formData.get("jumlah") as string), 
    lokasi: formData.get("lokasi"),
    kategori_id: parseInt(formData.get("kategori_id") as string)
  }]);
  if (!error) { revalidatePath("/"); redirect("/"); }
}

// EDIT BARANG
export async function updateBarang(formData: FormData) {
  const id = formData.get("id"); // Mengambil ID dari input hidden di form edit
  
  const { error } = await supabase
    .from("barang")
    .update({ 
      nama: formData.get("nama"), 
      jumlah: parseInt(formData.get("jumlah") as string), 
      lokasi: formData.get("lokasi"),
      kategori_id: parseInt(formData.get("kategori_id") as string)
    })
    .eq("id", id); // Mencocokkan ID agar yang terupdate hanya 1 barang itu saja

  if (error) {
    console.error("Gagal update:", error.message);
    return;
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
  await supabase.from("barang").update({ is_deleted: false }).eq("id", id);
  revalidatePath("/sampah");
}

// HAPUS PERMANEN
export async function hapusPermanen(id: number) {
  await supabase.from("barang").delete().eq("id", id);
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