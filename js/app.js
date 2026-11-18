
import { openDatabase } from "./db.js";

import {
  loadTransactions,
  createTransaction,
  removeTransaction
} from "./transactions.js";

let db = null;

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);

function getToday() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000)
    .toISOString()
    .slice(0, 10);
}

async function renderTransactions() {
  const items = await loadTransactions(db);

  const income = items
    .filter(item => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const expense = items
    .filter(item => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  document.getElementById("balance").textContent =
    rupiah(income - expense);

  document.getElementById("income").textContent = rupiah(income);
  document.getElementById("expense").textContent = rupiah(expense);

  const container = document.getElementById("transactions");
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML =
      '<p class="empty">Belum ada transaksi.</p>';
    return;
  }

  items.sort((a, b) =>
    b.date.localeCompare(a.date) || b.id - a.id
  );

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "transaction";

    const info = document.createElement("div");

    const name = document.createElement("strong");
    name.textContent = item.description;

    const detail = document.createElement("small");
    detail.textContent = `${item.category} • ${item.date}`;

    info.append(name, detail);

    const right = document.createElement("div");
    right.className = "right";

    const value = document.createElement("strong");
    value.className =
      item.type === "income" ? "income" : "expense";

    value.textContent =
      (item.type === "income" ? "+" : "-") +
      rupiah(item.amount);

    const button = document.createElement("button");
    button.className = "delete";
    button.textContent = "Hapus";

    button.addEventListener("click", async () => {
      if (confirm("Hapus transaksi ini?")) {
        try {
          await removeTransaction(db, item.id);
          await renderTransactions();
        } catch (error) {
          alert("Transaksi gagal dihapus.");
          console.error(error);
        }
      }
    });

    right.append(value, document.createElement("br"), button);
    row.append(info, right);
    container.append(row);
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const data = {
    type: document.getElementById("type").value,
    description: document.getElementById("description").value.trim(),
    amount: Number(document.getElementById("amount").value),
    category: document.getElementById("category").value,
    date: document.getElementById("date").value
  };

  try {
    await createTransaction(db, data);

    event.target.reset();
    document.getElementById("date").value = getToday();

    await renderTransactions();

  } catch (error) {
    alert(error.message || "Transaksi gagal disimpan.");
    console.error(error);
  }
}

async function startApp() {
  const status = document.getElementById("status");

  try {
    if (!("indexedDB" in window)) {
      throw new Error("IndexedDB tidak tersedia.");
    }

    db = await openDatabase();

    document.getElementById("date").value = getToday();

    document.getElementById("transactionForm")
      .addEventListener("submit", handleFormSubmit);

    await renderTransactions();

    status.textContent = "Penyimpanan lokal aktif.";

  } catch (error) {
    status.textContent = "Penyimpanan gagal diaktifkan.";
    console.error("FINORA Error:", error);
    alert("FINORA gagal membuka penyimpanan.");
  }
}

startApp();
