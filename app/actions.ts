"use server"

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Fungsi Tambah Barang
export async function tambahBarang(formData: FormData) {
  "use server"
  const nama = formData.get("nama");
  console.log("Mencoba menyimpan barang:", nama); // Cek ini muncul di terminal tidak?

  const { error } = await supabase.from("barang").insert([{ 
    nama: formData.get("nama"), 
    jumlah: formData.get("jumlah"), 
    lokasi: formData.get("lokasi") 
  }]);

  if (error) {
    console.error("Error Supabase:", error.message);
    return;
  }

  revalidatePath("/");
  redirect("/");
}

// Fungsi Hapus Barang
export async function hapusBarang(id: number) {
  await supabase.from("barang").delete().eq("id", id);
  revalidatePath("/");
}