# Sweet Order — Online Cookies & Brownies

## 1. Buat database
1. Buat project Supabase.
2. Buka SQL Editor.
3. Jalankan seluruh isi `schema.sql`.
4. Buat satu akun admin di Supabase Authentication > Users.
5. Salin Project URL dan anon/publishable key ke `config.js`.

## 2. Jalankan lokal
Bisa memakai Live Server di VS Code. Jangan membuka file langsung dengan file:// bila browser memblokir module/request.

## 3. Deploy
Upload folder ini ke repository GitHub, lalu import repository tersebut ke Vercel.
Setelah deploy, web pelanggan ada di `/` dan dashboard admin di `/admin.html`.

## 4. Keamanan
`config.js` hanya boleh berisi Supabase URL + anon/publishable key. Jangan masukkan `service_role` atau secret key ke browser.

## 5. Catatan
Versi ini sudah memakai database online dan autentikasi admin. WhatsApp notification/payment gateway belum diaktifkan; dapat ditambahkan pada tahap berikutnya.
