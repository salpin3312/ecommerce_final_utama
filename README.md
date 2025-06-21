# Panduan Instalasi Proyek

Proyek ini terdiri dari dua bagian utama:

-  **Backend (server)**: API menggunakan Express.js, Prisma, dan MySQL.
-  **Frontend (client)**: Aplikasi React dengan Vite.

## Prasyarat

Pastikan Anda sudah menginstall:

-  [Node.js](https://nodejs.org/) (disarankan versi 18 ke atas)
-  [npm](https://www.npmjs.com/) (biasanya sudah termasuk dalam Node.js)
-  [MySQL](https://www.mysql.com/) (untuk database backend)

---

## 1. Instalasi Backend (server)

1. **Masuk ke folder server:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Siapkan file environment:**

   -  Buat file `.env` di dalam folder `server`.
   -  Contoh isi `.env`:
      ```
      PORT=5000
      DATABASE_URL="mysql://user:password@localhost:3306/nama_database"
      ```
   -  Ganti `user`, `password`, dan `nama_database` sesuai konfigurasi MySQL Anda.

4. **Migrasi dan seed database (opsional):**

   ```bash
   npx prisma migrate dev
   npm run seed
   ```

5. **Jalankan server:**
   ```bash
   npm run dev
   ```
   Server akan berjalan di `http://localhost:5000` (atau sesuai PORT di .env).

---

## 2. Instalasi Frontend (client)

1. **Masuk ke folder client:**

   ```bash
   cd client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```
   Frontend akan berjalan di `http://localhost:5173` (default Vite).

---

## 3. Koneksi Frontend & Backend

Pastikan:

-  Server backend berjalan di `http://localhost:5000`
-  Frontend berjalan di `http://localhost:5173`
-  Jika ingin mengubah alamat backend di frontend, sesuaikan pada bagian pemanggilan API di kode React.

---

## 4. Dokumentasi API

Setelah backend berjalan, dokumentasi API dapat diakses di:

```
http://localhost:5000/api-docs
```

---

## 5. Troubleshooting

-  Jika ada error koneksi database, pastikan `DATABASE_URL` di `.env` sudah benar dan MySQL berjalan.
-  Jika port bentrok, ubah `PORT` di `.env` backend atau port Vite di frontend (`vite.config.js`).

---

Apabila ada pertanyaan lebih lanjut, silakan hubungi tim pengembang.

<!-- ID PASSWORD ADMIN & USER -->

1. Admin
   email : admin@example.com
   password : admin123

2. User
   email : user@gmail.com
   password : user1234
