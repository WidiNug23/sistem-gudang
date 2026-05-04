"use server"

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * --- ACTIONS INVENTORY (BARANG) ---
 */

export async function tambahBarang(formData: FormData) {
  const nama = formData.get("nama") as string;
  const jumlah = parseInt(formData.get("jumlah") as string) || 0;
  const lokasi = formData.get("lokasi") as string;
  const catatan = formData.get("catatan") as string;
  const kategoriIds = formData.getAll("kategori") as string[]; 

  const { data: barangBaru, error: errorBarang } = await supabase
    .from("barang")
    .insert([{ nama, jumlah, lokasi, catatan, is_deleted: false }])
    .select()
    .single();

  if (errorBarang) throw new Error(errorBarang.message);

  if (kategoriIds.length > 0 && barangBaru) {
    const relasi = kategoriIds.map((katId) => ({
      barang_id: barangBaru.id,
      kategori_id: parseInt(katId),
    }));
    await supabase.from("barang_kategori").insert(relasi);
  }

  await supabase.from("stock_logs").insert({
    barang_id: barangBaru.id,
    change_amount: jumlah,
    type: 'MASUK',
    reason: 'Registrasi unit baru ke sistem'
  });

  revalidatePath("/");
  redirect("/");
}

export async function updateBarang(formData: FormData) {
  const id = formData.get("id") as string;
  const nama = formData.get("nama") as string;
  const jumlah = parseInt(formData.get("jumlah") as string) || 0;
  const lokasi = formData.get("lokasi") as string;
  const catatan = formData.get("catatan") as string;
  const kategoriIds = formData.getAll("kategori") as string[];

  const { data: oldItem } = await supabase.from("barang").select("jumlah").eq("id", id).single();
  const selisih = jumlah - (oldItem?.jumlah || 0);

  const { error: errorBarang } = await supabase
    .from("barang")
    .update({ nama, jumlah, lokasi, catatan, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (errorBarang) throw new Error(errorBarang.message);

  await supabase.from("barang_kategori").delete().eq("barang_id", id);
  if (kategoriIds.length > 0) {
    const relasi = kategoriIds.map((katId) => ({
      barang_id: parseInt(id),
      kategori_id: parseInt(katId),
    }));
    await supabase.from("barang_kategori").insert(relasi);
  }

  if (selisih !== 0) {
    await supabase.from("stock_logs").insert({
      barang_id: id,
      change_amount: selisih,
      type: 'ADJUSTMENT',
      reason: 'Update manual via form edit'
    });
  }

  revalidatePath("/");
  redirect("/");
}

/**
 * --- ACTIONS PRODUKSI & BOM ---
 */

export async function adjustStok(formData: FormData) {
  const id = parseInt(formData.get("id") as string);
  const amount = parseInt(formData.get("amount") as string);
  const reason = formData.get("reason") as string;

  if (isNaN(id) || isNaN(amount)) throw new Error("Data tidak valid");

  const { error: errorStok } = await supabase.rpc('increment_stock', { 
    row_id: id, 
    amount: amount 
  });

  if (errorStok) throw new Error(errorStok.message);

  await supabase.from("stock_logs").insert({
    barang_id: id,
    change_amount: amount,
    type: 'ADJUSTMENT',
    reason: reason || 'Penyesuaian stok manual'
  });

  revalidatePath("/");
  revalidatePath("/produksi");
}

export async function submitProduksi(formData: FormData) {
  const parentId = parseInt(formData.get("parentId") as string);
  const cycles = parseInt(formData.get("qty") as string);

  if (isNaN(parentId) || isNaN(cycles) || cycles <= 0) {
    throw new Error("Pilih bahan baku dan tentukan jumlah siklus yang valid.");
  }

  // PERBAIKAN: Gunakan .order() dan .limit(1) alih-alih .maybeSingle()
  // Ini akan mengambil resep terbaru jika ada data ganda (duplikat)
  const { data: recipes, error: recipeError } = await supabase
    .from("bom")
    .select("quantity_produced, child_id")
    .eq("parent_id", parentId)
    .order("created_at", { ascending: false }) // Ambil yang paling baru dibuat
    .limit(1);

  if (recipeError) throw new Error("Database Error: " + recipeError.message);
  
  // Karena .limit(1) mengembalikan array, kita ambil index ke-0
  const recipe = recipes?.[0];

  if (!recipe) {
    throw new Error(`Resep tidak ditemukan untuk ID bahan: ${parentId}. Pastikan resep sudah didaftarkan di panel nomor 1.`);
  }

  const totalProduced = cycles * recipe.quantity_produced; 
  const totalConsumed = cycles;

  // Kurangi Bahan Baku
  const { error: errOut } = await supabase.rpc('increment_stock', { 
    row_id: parentId, 
    amount: -totalConsumed 
  });
  if (errOut) throw new Error("Gagal mengurangi stok bahan: " + errOut.message);

  // Tambah Barang Jadi
  const { error: errIn } = await supabase.rpc('increment_stock', { 
    row_id: recipe.child_id, 
    amount: totalProduced 
  });
  if (errIn) throw new Error("Gagal menambah stok hasil: " + errIn.message);

  // Catat Log Ganda
  await supabase.from("stock_logs").insert([
    {
      barang_id: parentId,
      change_amount: -totalConsumed,
      type: 'PRODUKSI_OUT',
      reason: `Digunakan untuk produksi ${totalProduced} unit barang jadi`
    },
    {
      barang_id: recipe.child_id,
      change_amount: totalProduced,
      type: 'PRODUKSI_IN',
      reason: `Hasil produksi dari ${totalConsumed} unit bahan baku`
    }
  ]);

  revalidatePath("/");
  revalidatePath("/produksi");
}

export async function saveResep(formData: FormData) {
  const pId = parseInt(formData.get("pId") as string);
  const cId = parseInt(formData.get("cId") as string);
  const qty = parseInt(formData.get("qty") as string);

  if (!pId || !cId || isNaN(qty)) throw new Error("Data resep tidak lengkap.");

  const { error } = await supabase
    .from("bom")
    .insert([{ parent_id: pId, child_id: cId, quantity_produced: qty }]);

  if (error) throw new Error(error.message);

  revalidatePath("/produksi");
}

export async function hapusResepBOM(id: number) {
  const { error } = await supabase.from("bom").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/produksi");
}

/**
 * --- ACTIONS TRASH & RECOVERY ---
 */

export async function softDeleteBarang(id: number) {
  await supabase.from("barang").update({ is_deleted: true }).eq("id", id);
  revalidatePath("/");
}

export async function restoreBarang(id: number) {
  await supabase.from("barang").update({ is_deleted: false }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/sampah");
}

export async function hapusPermanen(id: number) {
  await supabase.from("barang_kategori").delete().eq("barang_id", id);
  await supabase.from("stock_logs").delete().eq("barang_id", id);
  await supabase.from("bom").delete().or(`parent_id.eq.${id},child_id.eq.${id}`);
  
  const { error } = await supabase.from("barang").delete().eq("id", id);
  if (error) throw new Error(error.message);
  
  revalidatePath("/sampah");
  revalidatePath("/");
}

/**
 * --- ACTIONS KATEGORI ---
 */

export async function tambahKategori(formData: FormData) {
  const nama = formData.get("nama_kategori");
  if (!nama) return;
  await supabase.from("kategori").insert([{ nama_kategori: nama }]);
  revalidatePath("/kategori");
}

export async function updateKategori(formData: FormData) {
  const id = formData.get("id");
  const nama = formData.get("nama_kategori");
  if (!id || !nama) return;
  await supabase.from("kategori").update({ nama_kategori: nama }).eq("id", id);
  revalidatePath("/kategori");
}

export async function hapusKategori(id: number) {
  await supabase.from("kategori").delete().eq("id", id);
  revalidatePath("/kategori");
}