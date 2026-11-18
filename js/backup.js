
import { getAllTransactions, replaceAllTransactions } from "./db.js";
import { validateTransaction } from "./validation.js";

// EXPORT: Membuat file backup JSON
export async function exportBackup(db) {
  const transactions = await getAllTransactions(db);

  const backupData = {
    app: "FINORA",
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions: transactions
  };

  const json = JSON.stringify(backupData, null, 2);

  const blob = new Blob([json], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `finora-backup-${Date.now()}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

// IMPORT: Memulihkan data dari file JSON
export async function importBackup(db, file) {
  if (!file) {
    throw new Error("File backup belum dipilih.");
  }

  const text = await file.text();
  let backupData;

  try {
    backupData = JSON.parse(text);
  } catch {
    throw new Error("Format file JSON tidak valid.");
  }

  if (
    backupData.app !== "FINORA" ||
    backupData.version !== 1 ||
    !Array.isArray(backupData.transactions)
  ) {
    throw new Error("Format backup FINORA tidak dikenali.");
  }

  const transactions = backupData.transactions;
  const ids = new Set();

  for (const item of transactions) {
    const validation = validateTransaction(item);

    if (
      !validation.valid ||
      !Number.isSafeInteger(item.id) ||
      item.id <= 0 ||
      ids.has(item.id)
    ) {
      throw new Error("Data transaksi dalam backup tidak valid.");
    }

    ids.add(item.id);
  }

  await replaceAllTransactions(db, transactions);

  return transactions.length;
}
