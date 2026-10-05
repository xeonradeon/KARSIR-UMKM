# KARSIR-UMKM

[![License](https://img.shields.io/github/license/sannnproject/KARSIR-UMKM?style=flat-square)](https://github.com/sannnproject/KARSIR-UMKM/blob/main/LICENSE)
[![Top Language](https://img.shields.io/github/languages/top/sannnproject/KARSIR-UMKM?style=flat-square)](https://github.com/sannnproject/KARSIR-UMKM)
[![Last Commit](https://img.shields.io/github/last-commit/sannnproject/KARSIR-UMKM?style=flat-square)](https://github.com/sannnproject/KARSIR-UMKM/commits)
[![Open Issues](https://img.shields.io/github/issues/sannnproject/KARSIR-UMKM?style=flat-square)](https://github.com/sannnproject/KARSIR-UMKM/issues)

Modern all‑in‑one POS untuk UMKM Indonesia — cashier, inventory, sales, customers, reports, loyalty & multi‑outlet. Dibangun menggunakan Next.js (App Router) + TypeScript + Tailwind CSS + Prisma (PostgreSQL).

Ringkasan singkat
-----------------
KARSIR‑UMKM adalah aplikasi web Point‑Of‑Sale yang menargetkan usaha mikro, kecil, dan menengah. Fokus pada alur kasir cepat, manajemen inventori multi‑outlet, laporan usaha, dan fitur loyalty. UI/UX dibuat dengan Next.js + TypeScript dan utilitas Tailwind CSS; persistence dan schema‑driven model dikelola dengan Prisma (schema.prisma ada di folder prisma/).

Daftar isi
---------
- [What this is](#what-this-is)
- [Stack & Notable libs](#stack--notable-libs)
- [Struktur repository (penting)](#struktur-repository-penting)
- [Bagaimana aplikasi bekerja (high level)](#bagaimana-aplikasi-bekerja-high-level)
- [Persiapan development (langkah cepat)](#persiapan-development-langkah-cepat)
- [Environment variables (rekomendasi .env.example)](#environment-variables-rekomendasi-envexample)
- [Prisma & Database](#prisma--database)
- [Menjalankan aplikasi (dev / build / prod)](#menjalankan-aplikasi-dev--build--prod)
- [Deployment rekomendasi](#deployment-rekomendasi)
- [Testing, linting & quality gates](#testing-linting--quality-gates)
- [Keamanan & best practices operasi](#keamanan--best-practices-operasi)
- [Contributing](#contributing)
- [License](#license)
- [Catatan repo‑spesifik & checklist sebelum run](#catatan-repo-spesifik--checklist-sebelum-run)

What this is
------------
Aplikasi POS berbasis web untuk UMKM Indonesia yang mendukung kasir, manajemen produk & stok, pembelian, laporan, dan loyalty — digunakan oleh pemilik toko, cashier, dan admin outlet.

Stack & Notable libs
--------------------
- Language: TypeScript (seluruh kode sumber utama)
- Framework / runtime: Next.js (App Router) — ada folder `app/` dan `next.config.ts`
- Styling: Tailwind CSS (global styles di `app/globals.css`, postcss config tersedia)
- ORM / DB: Prisma (schema di `prisma/schema.prisma`, datasource = postgresql)
- Notable libraries (di kode berdasarkan struktur):
  - prisma (prisma client, migrations)
  - Tailwind utilities (postcss + tailwind)
  - React / Next.js components (App Router, server/client components)
  - Struktur komponen modular (`components/` banyak subfolder seperti pos, products, layout, dsb.)

Struktur repository (top-level penting)
---------------------------------------
(berdasarkan isi repo saat ini — saya hanya menampilkan yang relevan)
```
.eslintrc.json         # ESLint config
.gitignore
README.md              # (file ini — diupdate)
app/                   # Next.js App Router (pages/layout, page.tsx, api routes)
  layout.tsx
  page.tsx
  globals.css
components/            # UI & Views (pos, products, layout, reports, dsb.)
context/               # React context providers (AppContext, CartContext)
hooks/                 # custom hooks
lib/                   # util/klien helper (helpers, API clients)
prisma/
  schema.prisma        # Prisma schema (postgreSQL provider — models: Business, Product, Transaction, Inventory...)
src/                   # (ada; periksa untuk implementasi utilities / dukungan)
types/                 # shared types (TypeScript)
next.config.ts
next-env.d.ts
tsconfig.json
postcss.config.mjs
vite.config.ts         # NOTE: ada — lihat catatan tentang package.json/vite
package.json           # NOTE: berisi skrip & deps (lihat penjelasan tentang mismatch)
index.html             # NOTE: ada; biasanya untuk Vite — periksa apakah diperlukan
prisma/schema.prisma   # (terlihat pada tree, panjang, model lengkap)
```

How it fits together (runtime shape)
-----------------------------------
- Frontend: Next.js App Router (folder `app/`) — entry point `app/page.tsx` yang membungkus seluruh aplikasi menggunakan `AppProvider` & `CartProvider` dari `context/`. Komponen layout (Header, Sidebar, MobileNav, dsb.) berada di `components/layout/`.
- Views: Banyak "view modules" terpisah (Dashboard, POS terminal, Products, Inventory, Transactions, Reports, Customers, Outlets, Settings, dst.) di `components/*`.
- API: Next.js API routes ada di `app/api/` (server-side handlers). Mereka menggunakan Prisma Client (generated) untuk operasi database.
- Persistence: Prisma Client (generated) berinteraksi dengan Postgres sesuai `prisma/schema.prisma`. Model utama: Business, Outlet, User, Product/ProductVariant, Inventory, Transaction/TransactionItem, Payment, Promotion, Voucher, Purchase, InventoryMovement.
- Data flow (contoh transaksi):
  1. Kasir membuat transaksi melalui UI POS (component `components/pos/PosTerminal`).
  2. UI panggil API route Next.js mengirim payload transaksi.
  3. Server handler memvalidasi payload, memulai transaksi DB (Prisma transaction) yang:
     - membuat `Transaction` + `TransactionItem[]`
     - membuat `Payment` record(s)
     - menambah `InventoryMovement` dan menurunkan `Inventory.quantity` sesuai outlet
     - update `Customer.loyalty` / `LoyaltyTransaction` bila ada
  4. Response dikirim ke client; client menampilkan invoice dan event UI (print/open drawer, dsb.) sesuai BusinessSettings.

Persiapan development (langkah cepat)
------------------------------------
```
Prasyarat:
- Node.js (direkomendasikan LTS terbaru, mis. 18+/20+)
- PostgreSQL (untuk development; atau SQLite jika ingin cepat, tapi prisma/schema.prisma memakai provider postgresql)
- pnpm / npm / yarn (pakai salah satu)
```
Langkah:
```
1. Clone
   git clone https://github.com/sannnproject/KARSIR-UMKM.git
   cd KARSIR-UMKM
```
2. Periksa package.json
   - Catatan: package.json saat ini berisi skrip Vite dan dependensi Vite/React; namun repo mengandung Next.js (app/ dan next.config.ts). Jika Anda menggunakan Next.js, perbarui package.json agar memiliki skrip:
     
     ```
     - "dev": "next dev"
     - "build": "next build"
     - "start": "next start"
     - dan dependency "next" (sesuaikan versi stabil terbaru)
     ```
   - Jika repo dimaksudkan untuk Vite/React standalone, pastikan `app/` Next.js tidak dipakai. Pastikan keputusan stack sebelum menjalankan.

3. Install deps
   ```
   - npm install
   - atau yarn install
   - atau pnpm install

5. Setup .env (lihat bagian ENV)

Environment variables (rekomendasi .env.example)
-----------------------------------------------
Buat file `.env` atau `.env.local` di root:
```
# Database
DATABASE_URL="postgresql://dbuser:dbpass@localhost:5432/karsir_umkm?schema=public"

# Next.js / app
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Session / Auth (jika dipakai)
NEXTAUTH_SECRET="replace-with-secure-random"
JWT_SECRET="replace-with-secure-random"

# Prisma
# (tidak ada var Prisma tambahan default; namun sesuaikan bila memakai shadow db)
```

Prisma & Database
-----------------
- Prisma schema: `prisma/schema.prisma` (provider = "postgresql" dan url = env("DATABASE_URL")).
- Generate client:
  npx prisma generate
- Migrations (dev):
  npx prisma migrate dev --name init
  - Perintah di atas membuat/menerapkan migrasi berdasarkan schema.prisma dan menghasilkan Prisma Client.
- Deploy migrations (production):
  npx prisma migrate deploy
- Seed data:
  - Jika ada script seed (cek `prisma/seed.ts` atau package.json scripts), jalankan `npm run prisma:seed` atau `node prisma/seed.js` sesuai implementasi.

Menjalankan aplikasi (dev / build / production)
-----------------------------------------------
Contoh (Next.js):
- Development:
  npm run dev
  (harus ada script "dev":"next dev" di package.json)

- Build:
  npm run build

- Start (production):
  npm run start

Prisma:
- npx prisma generate
- npx prisma migrate dev --name <migration-name>
- npx prisma migrate deploy

Jika saat ini package.json belum diupdate untuk Next, lakukan update dependency & scripts sebelum menjalankan. Saya bisa bantu menyiapkan patch package.json jika Anda mau.

Deployment rekomendasi
----------------------
- Vercel: native support Next.js App Router. Atur environment variables di dashboard dan gunakan `npx prisma migrate deploy` pada proses deployment, atau jalankan migrasi via CI ke Production DB.
- Container: Dockerfile + docker-compose (Postgres + app). Jalankan migrasi pada entrypoint/CI.
- Pastikan backup DB & monitoring, dan uji migrasi di staging.

Testing, linting & quality gates
-------------------------------
- Lint/Typecheck: jalankan `npm run lint` atau `tsc --noEmit` (cek package.json untuk skrip).
- Testing: tambahkan test runner (Vitest / Jest / Playwright) jika belum ada untuk unit/integration e2e (kritis untuk logika transaksi & update stok).
- CI: integrasikan tests & migrations di pipeline (GitHub Actions atau platform CI lainnya) sebelum merge.

Keamanan & best practices operasi
---------------------------------
- Jangan commit secrets ke repo. Gunakan env vars / secret manager.
- Validasi payload di server (Next API routes) sebelum menulis ke DB.
- Gunakan Prisma transaction untuk operasi multi-step (create transaction + update inventory + loyalty) agar atomic.
- Batasi akses API/permissions per role (RoleType ada di prisma: OWNER, ADMIN, CASHIER, STAFF).
- Audit logs: gunakan model AuditLog yang tersedia untuk mencatat tindakan sensitif.

Contributing
------------
1. Fork repo → buat branch feature/xxx atau fix/xxx.
2. Ikuti konvensi commit (feat:, fix:, docs:, chore:).
3. Tambahkan test bila mengubah logic bisnis.
4. Buka PR ke branch default (main). Sertakan deskripsi & langkah verifikasi.

License
-------
Proyek dilisensikan di bawah Apache License 2.0. Lihat file LICENSE di repo untuk teks lengkap.

Catatan repo‑spesifik & checklist sebelum run
---------------------------------------------
1. Prisma:
   - `prisma/schema.prisma` ada dan menggunakan provider postgresql (lihat file). Pastikan `DATABASE_URL` mengarah ke Postgres.
   - Schema mencakup model kunci: Business, Outlet, User, Product, Inventory, Transaction, TransactionItem, Payment, Purchase, InventoryMovement, dll.

2. Next.js:
   - Folder `app/` serta `next.config.ts` dan `next-env.d.ts` menandakan Next.js App Router dipakai.
   - `app/page.tsx` menggunakan `AppProvider` dan `CartProvider` dari `context/` serta banyak view components (pos, products, inventory, dsb.).

3. package.json & vite.config.ts / index.html:
   - package.json saat ini berisi skrip Vite dan dependensi Vite/React; ada juga `vite.config.ts` dan `index.html`.
   - Ini adalah inkonsistensi: jika targetnya Next.js, Anda harus:
     - menambahkan dependency "next" (versi kompatibel dengan React/TS),
     - mengganti skrip dev/build/start ke Next.js,
     - menghapus/menonaktifkan skrip Vite jika tidak diperlukan.
   - Jika targetnya adalah aplikasi Vite biasa, maka `app/` Next.js mungkin tidak digunakan — review diperlukan.

4. Langkah yang saya rekomendasikan sekarang:
   - Putuskan stack final (Next.js vs Vite). Berdasarkan struktur `app/` dan `next.config.ts`, saya sarankan Next.js.
   - Update package.json agar sesuai Next.js (saya bisa bantu buat patch).
   - Buat `.env.example` berdasarkan rekomendasi di atas.
   - Jalankan `npx prisma generate` lalu `npx prisma migrate dev --name init`.
# KARSIR-UMKM
