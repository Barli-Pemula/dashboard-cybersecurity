# CyberSentinel Dashboard

Aplikasi dashboard cybersecurity berbasis Next.js untuk simulasi monitoring ancaman, pemindaian URL, dan manajemen laporan keamanan.

## Ringkasan

CyberSentinel menyediakan alur kerja sederhana untuk tim keamanan:

- Registrasi dan login pengguna dengan NextAuth (Credentials).
- Dashboard ringkas untuk melihat metrik dan feed ancaman.
- Scanner URL untuk menghasilkan temuan dan skor risiko.
- Modul laporan untuk membuat serta melihat histori report.
- Endpoint threat stream berbasis Server-Sent Events (SSE).

## Fitur Utama

- Authentication + session JWT.
- Proteksi route melalui middleware.
- Validasi input dan sanitasi data.
- Rate limiting sederhana untuk endpoint sensitif.
- Penyimpanan data dengan Prisma + SQLite.
- UI modern dengan Tailwind CSS + framer-motion.

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- NextAuth
- Prisma
- SQLite
- Tailwind CSS
- Framer Motion

## Struktur Folder

```text
app/
  (auth)/
    login/page.tsx
    register/page.tsx
  (dashboard)/
    dashboard/page.tsx
    reports/page.tsx
    scanner/page.tsx
  api/
    auth/[...nextauth]/route.ts
    auth/register/route.ts
    reports/route.ts
    scan/route.ts
    threats/route.ts
    threats/stream/route.ts
components/
lib/
prisma/
middleware.ts
```

## Menjalankan Project Secara Lokal

### 1) Install dependency

```bash
npm install
```

### 2) Siapkan environment variable

Buat file `.env` di root project:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="ganti_dengan_secret_random_yang_kuat"
NEXTAUTH_URL="http://localhost:3000"
```

Tips membuat secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3) Jalankan migrasi database

```bash
npx prisma migrate dev
```

### 4) Jalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000` di browser.

## Akun dan Autentikasi

- Endpoint registrasi: `POST /api/auth/register`
- Login menggunakan Credentials provider dari NextAuth.
- Session strategy menggunakan JWT.
- Route `/dashboard`, `/scanner`, `/reports` hanya bisa diakses pengguna terautentikasi.

## Endpoint API

### Auth

- `POST /api/auth/register`
- `GET|POST /api/auth/[...nextauth]`

### Scanner

- `POST /api/scan`
  - Body: `{ "url": "https://example.com", "scanType": "full" }`
- `GET /api/scan`
  - Mengambil riwayat scan user login.

### Reports

- `POST /api/reports`
  - Body minimum: `{ "title": "...", "summary": "..." }`
- `GET /api/reports`
  - Mengambil riwayat report user login.

### Threats

- `GET /api/threats`
  - Mengambil daftar event ancaman dari database.
- `GET /api/threats/stream`
  - Stream event ancaman real-time (SSE).

## Script NPM

- `npm run dev` - Jalankan mode development.
- `npm run build` - Build production.
- `npm run start` - Jalankan hasil build.
- `npm run lint` - Jalankan linting.

## Prisma

- Schema ada di `prisma/schema.prisma`.
- Default provider database: SQLite.
- Saat install dependency, `prisma generate` akan dijalankan otomatis melalui script `postinstall`.

## Catatan Keamanan

Project ini sudah menerapkan dasar keamanan berikut:

- Hash password dengan bcrypt.
- Input sanitization untuk beberapa endpoint.
- URL sanitization untuk scanner.
- Rate limiting untuk endpoint register dan scan.
- Security headers dasar pada route API via middleware.

Tetap disarankan menambah:

- Logging audit yang lebih detail.
- Mekanisme RBAC lebih ketat.
- Integrasi scanner/feeds eksternal untuk data ancaman nyata.

## Deployment Singkat

1. Set environment variable produksi (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
2. Jalankan `npm run build`.
3. Jalankan `npm run start`.
4. Pastikan database siap dan migrasi sudah diterapkan.

## License

Gunakan sesuai kebutuhan internal/edukasi, atau tambahkan lisensi resmi sesuai kebijakan project Anda.
