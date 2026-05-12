# Setup Eyang Bandan Family Tree

## 1. Setup Supabase Database

Buka **Supabase Dashboard** → project `eyang_bandan` → **SQL Editor** → **New Query**

Copy-paste isi file `supabase_schema.sql` dan klik **Run**.

Ini akan membuat:
- Tabel `family_members` dengan semua kolom yang dibutuhkan
- Index untuk performa query
- Row Level Security (RLS) policies

---

## 2. Ambil Credentials Supabase

Di Supabase Dashboard → **Project Settings** → **API**:

- **Project URL** → copy nilai `https://xxxxxxxxxxxx.supabase.co`
- **Project API Keys** → copy nilai `anon` / `public`

---

## 3. Isi File `.env`

Buka file `.env` di root project dan isi:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 4. Jalankan Project

```bash
npm run dev
```

Buka `http://localhost:5173`

---

## 5. Mulai Input Data

1. Buka halaman **Tambah Anggota** (`/add`)
2. Tambahkan **Eyang Bandan** sebagai anggota pertama (tidak perlu pilih orang tua)
3. Setelah itu, tambahkan anak-anak beliau satu per satu dengan memilih Eyang Bandan sebagai orang tua
4. Lanjutkan untuk generasi berikutnya

---

## Struktur Database

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID | Primary key (auto) |
| name | TEXT | Nama lengkap (wajib) |
| gender | TEXT | 'male' atau 'female' |
| photo_url | TEXT | URL atau base64 foto |
| bio | TEXT | Biografi singkat |
| birth_date | DATE | Tanggal lahir |
| death_date | DATE | Tanggal wafat |
| location_city | TEXT | Nama kota |
| location_lat | FLOAT | Latitude |
| location_lng | FLOAT | Longitude |
| parent_id | UUID | FK ke parent (null = root) |
| generation | INTEGER | Nomor generasi |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |
