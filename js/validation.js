
const VALID_TYPES = ["income", "expense"];

export function validateTransaction(data) {
  const errors = [];

  // Validasi jenis transaksi
  if (!VALID_TYPES.includes(data.type)) {
    errors.push("Jenis transaksi tidak valid.");
  }

  // Validasi nama transaksi
  if (
    typeof data.description !== "string" ||
    data.description.trim().length === 0
  ) {
    errors.push("Nama transaksi wajib diisi.");
  }

  // Validasi nominal
  if (
    !Number.isSafeInteger(data.amount) ||
    data.amount <= 0
  ) {
    errors.push("Nominal harus berupa bilangan bulat positif.");
  }

  // Validasi kategori
  if (
    typeof data.category !== "string" ||
    data.category.trim().length === 0
  ) {
    errors.push("Kategori wajib diisi.");
  }

  // Validasi tanggal
  if (
    typeof data.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date)
  ) {
    errors.push("Format tanggal tidak valid.");
  } else {
    const parsedDate = new Date(data.date + "T00:00:00");

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== data.date
    ) {
      errors.push("Tanggal tidak valid.");
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
