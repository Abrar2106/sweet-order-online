const statusForm = $("statusForm");

if (statusForm) {
  statusForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = statusForm.querySelector("button[type='submit']");
    const result = $("statusResult");
    const orderCode = $("statusOrderCode").value.trim().toUpperCase();

    if (!/^ORD-[A-Z0-9]{8}$/.test(orderCode)) {
      result.hidden = false;
      result.textContent = "Format nomor pesanan tidak valid. Contoh: ORD-631F8960";
      return;
    }

    btn.disabled = true;
    btn.textContent = "Mengecek...";
    result.hidden = true;

    const { data, error } = await db.rpc("get_order_status", {
      p_order_code: orderCode
    });

    btn.disabled = false;
    btn.textContent = "Cek Status";

    if (error) {
      console.error("Supabase status error:", error);
      result.hidden = false;
      result.textContent = "Status belum bisa dicek. Pastikan fungsi get_order_status sudah dibuat di Supabase.";
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row) {
      result.hidden = false;
      result.textContent = "❌ Nomor pesanan tidak ditemukan.";
      return;
    }

    const status = row.status || "Menunggu";

    const statusIcon = {
      "Menunggu": "⏳",
      "Diproses": "👨‍🍳",
      "Selesai": "✅"
    }[status] || "📦";

    result.hidden = false;
    result.innerHTML = `
      <b>Nomor pesanan: ${orderCode}</b><br>
      Status: <strong>${statusIcon} ${status}</strong>
    `;
  });
}
