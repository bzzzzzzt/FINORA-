
import { openDatabase } from "./db.js";

import {
  loadTransactions,
  createTransaction,
  removeTransaction
} from "./transactions.js";

import {
  exportBackup,
  importBackup
} from "./backup.js";

// Database utama FINORA
let db = null;

// Inisialisasi aplikasi
export async function initializeApp() {
  db = await openDatabase();

  console.log("FINORA database connected.");

  return true;
}

// Mengambil transaksi
export async function getTransactions() {
  return await loadTransactions(db);
}

// Menambah transaksi
export async function saveTransaction(data) {
  return await createTransaction(db, data);
}

// Menghapus transaksi
export async function deleteTransaction(id) {
  return await removeTransaction(db, id);
}

// Membuat backup
export async function backupData() {
  return await exportBackup(db);
}

// Memulihkan backup
export async function restoreData(file) {
  return await importBackup(db, file);
}
