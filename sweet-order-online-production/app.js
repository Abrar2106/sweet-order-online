const db = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const PRICE = { cookies: 5000, brownies: 35000 };
let qty = { cookies: 0, brownies: 0 };

const $ = (id) => document.getElementById(id);
const rp = (n) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
}).format(n);

function changeQty(product, value) {
  qty[product] = Math.max(0, qty[product] + value);
  render();
}

function render() {
  $("qCookies").textContent = qty.cookies;
  $("sCookies").textContent = qty.cookies;
  $("qBrownies").textContent = qty.brownies;
  $("sBrownies").textContent = qty.brownies;

  const total = qty.cookies * PRICE.cookies + qty.brownies * PRICE.brownies;
  $("total").textContent = rp(total);
}

function makeOrderCode() {
  const random = (crypto && crypto.randomUUID)
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 8)
    : Math.random().toString(36).slice(2, 10).toUpperCase();
  return `ORD-${random.toUpperCase()}`;
}

$("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const form = e.currentTarget;
  const btn = form.querySelector("button[type='submit']");
  const success = $("success");

  const customerName = $("name").value.trim();
  const phone = $("phone").value.trim();
  const address = $("address").value.trim();
  const preorderDay = $("day").value;
  const totalValue = qty.cookies * PRICE.cookies + qty.brownies * PRICE.brownies;

  if (!totalValue) {
    alert("Pilih minimal 1 produk.");
    return;
  }

  if (!customerName || !phone || !address || !preorderDay) {
    alert("Lengkapi data pemesan terlebih dahulu.");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Mengirim pesanan...";
  success.hidden = true;

  const orderCode = makeOrderCode();

  const order = {
    order_code: orderCode,
    customer_name: customerName,
    phone,
    address,
    preorder_day: preorderDay,
    cookies_qty: qty.cookies,
    brownies_qty: qty.brownies,
    total: totalValue,
    status: "Menunggu"
  };

  // Jangan memakai .select() setelah insert.
  // RLS hanya mengizinkan pelanggan (anon) membuat order,
  // bukan membaca data order. Karena itu nomor order dibuat di browser.
  const { error } = await db.from("orders").insert(order);

  btn.disabled = false;
  btn.textContent = "Kirim Pesanan";

  if (error) {
    console.error("Supabase insert error:", error);
    alert(`Pesanan gagal dikirim.\n\n${error.message}`);
    return;
  }

  success.hidden = false;
  success.innerHTML = `Pesanan berhasil!<br><b>Nomor pesanan: ${orderCode}</b><br>Total: ${rp(totalValue)}<br>Pre-order: ${preorderDay}`;

  form.reset();
  qty = { cookies: 0, brownies: 0 };
  render();

  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
});

render();
