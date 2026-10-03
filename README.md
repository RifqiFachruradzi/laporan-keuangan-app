# Accounting Management System

Aplikasi laporan keuangan (jurnal, buku besar, neraca saldo, aging piutang/hutang, dan laporan keuangan) berbasis Next.js dengan login dan database [Supabase](https://supabase.com).

## Setup Supabase

1. Buat project baru di [supabase.com](https://supabase.com/dashboard).
2. Buka **SQL Editor → New query**, salin seluruh isi [`supabase/schema.sql`](supabase/schema.sql), lalu klik **Run**.
   Ini membuat tabel `accounts`, `journals`, dan `journal_entries` beserta Row Level Security, sehingga setiap pengguna hanya bisa melihat datanya sendiri.
3. Buka **Authentication → URL Configuration**:
   - **Site URL**: alamat aplikasi, mis. `https://nama-app.vercel.app` (atau `http://localhost:3000` saat development).
   - **Redirect URLs**: tambahkan `https://nama-app.vercel.app/auth/callback` dan `http://localhost:3000/auth/callback`.
4. Ambil **Project URL** dan **Publishable key** (atau `anon` key) dari tombol **Connect** / **Project Settings → API Keys**.

## Environment variables

Salin `.env.example` menjadi `.env.local` dan isi:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxx
```

Saat deploy (mis. Vercel), isi variabel yang sama di **Project Settings → Environment Variables**, lalu redeploy.

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Semua halaman membutuhkan login; daftar akun baru lewat halaman **Daftar**.

Saat pertama kali login, aplikasi otomatis membuat Chart of Accounts bawaan. Jika browser tersebut masih menyimpan data lama (versi sebelum database, di localStorage), akun dan jurnal itu dipindahkan ke database sekali, dan salinannya disimpan sebagai `accounts-backup` / `journals-backup` di localStorage.
