
import {
  getAllTransactions,
  addTransaction,
  deleteTransaction
} from "./db.js";

import { validateTransaction } from "./validation.js";

// Mengambil seluruh transaksi
export async function loadTransactions(db) {
  return await getAllTransactions(db);
}

// Menambahkan transaksi dengan validasi
export async function createTransaction(db, data) {
  const validation = validateTransaction(data);

  if (!validation.valid) {
    throw new Error(validation.errors.join("\n"));
  }

  return await addTransaction(db, data);
}

// Menghapus transaksi
export async function removeTransaction(db, id) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("ID transaksi tidak valid.");
  }

  return await deleteTransaction(db, id);
}
