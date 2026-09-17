-- Jalankan di Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null default ('ORD-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  customer_name text not null,
  phone text not null,
  address text not null,
  preorder_day text not null check (preorder_day in ('Senin','Sabtu')),
  cookies_qty integer not null default 0 check (cookies_qty >= 0),
  brownies_qty integer not null default 0 check (brownies_qty >= 0),
  total integer not null check (total >= 0),
  status text not null default 'Menunggu' check (status in ('Menunggu','Diproses','Dikirim','Selesai','Dibatalkan')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Pelanggan boleh membuat order, tetapi tidak boleh membaca seluruh order.
create policy "public can create orders"
on public.orders for insert
to anon, authenticated
with check (
  preorder_day in ('Senin','Sabtu')
  and cookies_qty >= 0
  and brownies_qty >= 0
  and total = cookies_qty * 5000 + brownies_qty * 35000
  and (cookies_qty + brownies_qty) > 0
);

-- Admin yang login boleh melihat dan mengubah order.
create policy "authenticated can read orders"
on public.orders for select
to authenticated
using (true);

create policy "authenticated can update orders"
on public.orders for update
to authenticated
using (true)
with check (true);
