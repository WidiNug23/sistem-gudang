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

export async function saveResep(formData: FormData) {
  const parent_id = parseInt(formData.get("pId") as string);
  const child_id = parseInt(formData.get("cId") as string);
  const quantity_required = parseFloat(formData.get("qtyReq") as string) || 1;
  const quantity_produced = parseFloat(formData.get("qty") as string) || 1;

  if (!parent_id || !child_id) {
    throw new Error("Raw material dan hasil produk harus dipilih.");
  }

  const { error } = await supabase.from("bom").insert({
    parent_id,
    child_id,
    quantity_required,
    quantity_produced
  });

  if (error) {
    throw new Error("Gagal menyimpan resep: " + error.message);
  }

  revalidatePath("/produksi");
}

export async function hapusResepBOM(id: number) {
  const { error } = await supabase.from("bom").delete().eq("id", id);
  if (error) {
    throw new Error("Gagal menghapus resep: " + error.message);
  }
  revalidatePath("/produksi");
}

export async function submitProduksi(formData: FormData) {
  const bomId = formData.get("bomId") as string;
  const parentId = parseInt(formData.get("parentId") as string);
  const cycles = parseFloat(formData.get("qty") as string) || 1; // Multiplier
  const rawUsageQty = parseFloat(formData.get("rawUsageQty") as string) || 1; // Jumlah raw material aktual yang dipakai
  const waste = parseFloat(formData.get("waste") as string) || 0;
  const existingBatchId = formData.get("batchId") as string; 

  if (isNaN(cycles) || cycles <= 0 || isNaN(rawUsageQty) || rawUsageQty <= 0) {
    throw new Error("Input produksi tidak valid.");
  }

  // 1. Revert stok jika koreksi (batchId ada)
  if (existingBatchId && existingBatchId !== "undefined" && existingBatchId !== "") {
    const { data: oldLogs } = await supabase
      .from("stock_logs")
      .select("*")
      .eq("reference_id", existingBatchId);

    if (oldLogs) {
      for (const log of oldLogs) {
        await supabase.rpc('increment_stock', { 
          row_id: log.barang_id, 
          amount: -log.change_amount 
        });
      }
      await supabase.from("stock_logs").delete().eq("reference_id", existingBatchId);
    }
  }

  // 2. Query resep berdasarkan bomId unik atau fallback ke parent_id
  const query = supabase.from("bom").select("id, quantity_produced, quantity_required, parent_id, child_id");
  
  if (bomId && bomId !== "") {
    query.eq("id", parseInt(bomId));
  } else {
    query.eq("parent_id", parentId);
  }

  const { data: recipe } = await query.single();

  if (!recipe) throw new Error("Resep tidak ditemukan.");

  const activeParentId = recipe.parent_id;
  
  // Kalkulasi total hasil produksi berdasarkan rasio resep dan multiplier
  const actualOutput = rawUsageQty * recipe.quantity_produced * cycles;
  const totalRawUsed = rawUsageQty * cycles;
  const currentBatchId = (existingBatchId && existingBatchId !== "") ? existingBatchId : `BATCH-${Date.now()}`;

  // 3. Eksekusi Pengurangan Stok Raw Material & Penambahan Stok Hasil Output
  await supabase.rpc('increment_stock', { row_id: activeParentId, amount: -totalRawUsed });
  await supabase.rpc('increment_stock', { row_id: recipe.child_id, amount: actualOutput });

  const finalLogs = [
    {
      barang_id: activeParentId,
      change_amount: -totalRawUsed,
      type: 'PRODUKSI_OUT',
      reason: `Penggunaan material untuk produksi ${actualOutput} unit (Batch: ${currentBatchId})`,
      reference_id: currentBatchId
    },
    {
      barang_id: recipe.child_id,
      change_amount: actualOutput,
      type: 'PRODUKSI_IN',
      reason: `Hasil produksi (Batch: ${currentBatchId})`,
      reference_id: currentBatchId
    }
  ];

  if (waste > 0) {
    await supabase.rpc('increment_stock', { row_id: activeParentId, amount: -waste });
    finalLogs.push({
      barang_id: activeParentId,
      change_amount: -waste,
      type: 'WASTE',
      reason: `Waste produksi (Batch: ${currentBatchId})`,
      reference_id: currentBatchId
    });
  }

  await supabase.from("stock_logs").insert(finalLogs);

  revalidatePath("/");
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