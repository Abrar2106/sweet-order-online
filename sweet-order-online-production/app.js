// ==================== SUPABASE ====================

const db = supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
);

const $ = (id) => document.getElementById(id);


// ==================== HARGA PRODUK ====================

const PRICES = {
  cookies: 5000,
  brownies: 35000
};


// ==================== JUMLAH PESANAN ====================

let qty = {
  cookies: 0,
  brownies: 0
};


// ==================== UBAH JUMLAH ====================

function changeQty(type, amount) {
  qty[type] = Math.max(0, qty[type] + amount);
  render();
}


// ==================== TAMPILKAN PESANAN ====================

function render() {
  const qCookies = $("qCookies");
  const qBrownies = $("qBrownies");
  const sCookies = $("sCookies");
  const sBrownies = $("sBrownies");
  const totalEl = $("total");

  if (qCookies) {
    qCookies.textContent = qty.cookies;
  }

  if (qBrownies) {
    qBrownies.textContent = qty.brownies;
  }

  if (sCookies) {
    sCookies.textContent = qty.cookies;
  }

  if (sBrownies) {
    sBrownies.textContent = qty.brownies;
  }

  const total =
    qty.cookies * PRICES.cookies +
    qty.brownies * PRICES.brownies;

  if (totalEl) {
    totalEl.textContent =
      "Rp" + total.toLocaleString("id-ID");
  }

  return total;
}


// ==================== BUAT NOMOR PESANAN ====================

function makeOrderCode() {
  return "ORD-" +
    Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
}


// ==================== KIRIM PESANAN ====================

const orderForm = $("orderForm");

if (orderForm) {

  orderForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const total = render();

    // Pastikan ada produk
    if (qty.cookies === 0 && qty.brownies === 0) {
      alert("Pilih minimal 1 produk terlebih dahulu.");
      return;
    }

    const order = {

      order_code: makeOrderCode(),

      customer_name:
        $("name").value.trim(),

      phone:
        $("phone").value.trim(),

      address:
        $("address").value.trim(),

      preorder_day:
        $("day").value,

      cookies_qty:
        qty.cookies,

      brownies_qty:
        qty.brownies,

      total:

        total,

      status:
        "Menunggu"
    };


    const submitBtn =
      orderForm.querySelector(
        "button[type='submit']"
      );


    submitBtn.disabled = true;

    submitBtn.textContent =
      "Mengirim...";


    // Kirim ke Supabase
    const { error } =
      await db
        .from("orders")
        .insert(order);


    submitBtn.disabled = false;

    submitBtn.textContent =
      "Kirim Pesanan";


    const success =
      $("success");


    // Kalau gagal
    if (error) {

      console.error(
        "Supabase order error:",
        error
      );

      success.hidden = false;

      success.textContent =
        "Pesanan gagal dikirim. Silakan coba lagi.";

      return;
    }


    // Kalau berhasil
    success.hidden = false;

    success.innerHTML = `
      <strong>Pesanan berhasil dikirim! 🎉</strong><br>
      Nomor pesanan kamu:
      <strong>${order.order_code}</strong><br>
      Simpan nomor ini untuk mengecek status pesanan.
    `;


    // Reset form
    orderForm.reset();

    qty = {
      cookies: 0,
      brownies: 0
    };

    render();


    // Scroll ke pesan sukses
    success.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

  });

}


// ==================== CEK STATUS PESANAN ====================

const statusForm = $("statusForm");

if (statusForm) {

  statusForm.addEventListener(
    "submit",
    async (e) => {

      // PENTING:
      // Mencegah halaman reload/reset
      e.preventDefault();


      const btn =
        statusForm.querySelector(
          "button[type='submit']"
        );

      const result =
        $("statusResult");


      const orderCode =
        $("statusOrderCode")
          .value
          .trim()
          .toUpperCase();


      // Cek format nomor
      if (
        !/^ORD-[A-Z0-9]{8}$/.test(orderCode)
      ) {

        result.hidden = false;

        result.textContent =
          "Format nomor pesanan tidak valid. Contoh: ORD-631F8960";

        return;
      }


      // Loading
      btn.disabled = true;

      btn.textContent =
        "Mengecek...";

      result.hidden = true;


      // Ambil status dari Supabase
      const {
        data,
        error
      } = await db.rpc(
        "get_order_status",
        {
          p_order_code:
            orderCode
        }
      );


      // Selesai loading
      btn.disabled = false;

      btn.textContent =
        "Cek Status";


      // Error Supabase
      if (error) {

        console.error(
          "Supabase status error:",
          error
        );

        result.hidden = false;

        result.textContent =
          "Status belum bisa dicek. Pastikan fungsi get_order_status sudah dibuat di Supabase.";

        return;
      }


      // Ambil hasil pertama
      const row =
        Array.isArray(data)
          ? data[0]
          : data;


      // Nomor tidak ditemukan
      if (!row) {

        result.hidden = false;

        result.textContent =
          "❌ Nomor pesanan tidak ditemukan.";

        return;
      }


      // Status pesanan
      const status =
        row.status ||
        "Menunggu";


      // Icon status
      const statusIcon = {

        "Menunggu":
          "⏳",

        "Diproses":
          "👨‍🍳",

        "Selesai":
          "✅"

      }[status] || "📦";


      // Tampilkan hasil
      result.hidden = false;

      result.innerHTML = `
        <b>Nomor pesanan: ${orderCode}</b><br>
        Status:
        <strong>
          ${statusIcon} ${status}
        </strong>
      `;

    }
  );

}


// ==================== JALANKAN AWAL ====================

render();
