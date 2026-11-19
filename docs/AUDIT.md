# Audit perombakan CyberSentinel

## Cakupan

Seluruh source aplikasi, konfigurasi, skema Prisma, migrasi, dan dokumentasi diperiksa. Berkas `ctf-sentinelvm/` sudah ada sebelum pekerjaan ini dan tidak diubah. Skill anti-slop dan taste-skill dipasang di `.agents/skills/` untuk penggunaan lokal, bukan sebagai dependency runtime.

## Temuan dan perbaikan

| Area             | Kondisi awal                                                            | Perbaikan                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Akses contoh     | Seluruh ruang kerja memerlukan akun sungguhan                           | Demo satu klik dengan token bertanda tangan, cookie HttpOnly, masa sesi delapan jam, dan pemisahan dari tabel pengguna asli                      |
| Kejelasan data   | Metrik dan sebagian tindakan tidak selaras dengan data yang ditampilkan | Metrik diturunkan dari record workspace; contoh dan simulasi diberi label; pencarian, filter, detail, pagination, ekspor, serta reset tersambung |
| Scan dan laporan | Alur tidak nyaman dipakai dari hasil scan ke laporan                    | Profil scan yang sesuai jenis temuan, riwayat tersimpan, detail rekomendasi, pembuatan laporan dari hasil scan, dan validasi input               |
| Proteksi API     | Beberapa endpoint data menerima permintaan tanpa pemeriksaan sesi       | Pemeriksaan sesi untuk data ancaman dan stream; validasi input dan batas permintaan pada endpoint sensitif                                       |
| Tata letak       | Dashboard padat dan sulit dipakai pada layar kecil                      | Hierarki visual baru, navigasi mobile, grid yang menyesuaikan lebar, tabel yang berubah menjadi kartu, dialog dan target sentuh yang memadai     |
| Pengembangan     | Perintah lint lama meminta konfigurasi interaktif                       | ESLint CLI dengan konfigurasi proyek, pemeriksaan TypeScript, pengujian logika, dan verifikasi browser                                           |

## Verifikasi

- `npm test`: tiga pengujian lulus untuk validasi URL, profil temuan, dan perhitungan risiko.
- `npm run typecheck`: lulus.
- `npm run lint`: lulus setelah perbaikan konfigurasi.
- `npm run build`: build produksi berhasil.
- `npm run test:browser`: 11 kelompok lulus, mencakup akses anonim, demo, dashboard, scan, laporan, reset/keluar, auth form, unduhan JSON, dan runtime browser. Hasil ada di `artifacts/browser-verification.json` setelah pengujian (folder ini diabaikan Git).
- Halaman login, registrasi, dashboard, scanner, dan laporan diperiksa pada lebar 1440, 1280, 1024, 820, 768, 390, dan 320 piksel. Tiga halaman workspace tidak memiliki overflow horizontal atau kontrol yang keluar layar pada lebar tersebut.
- Screenshot desktop dan mobile ada di `artifacts/` setelah pengujian.
- Prisma melaporkan dua migrasi dan skema database lokal sudah mutakhir; database asli tidak dimodifikasi untuk membuat akun demo.
- Smoke test hasil build pada port 3100 dengan `ENABLE_DEMO=true`: API scan mengembalikan 401 sebelum login, demo mengembalikan 200 dengan cookie HttpOnly, API scan dapat diakses, lalu kembali 401 setelah keluar.

## Batas hasil

Scanner menghasilkan temuan simulasi berdasarkan URL dan profil; tidak menghubungi target. Threat stream juga simulasi. Pengujian browser memverifikasi alur demo dan formulir auth, sedangkan alur akun sungguhan tidak membuat user baru di database lokal.

Taste-skill dipakai untuk arahan tipografi, tata letak, aksesibilitas, dan pemeriksaan browser. Gate pemasaran umum pada `/login` masih menandai pola yang memang diperlukan di aplikasi operasional, seperti label **demo**, alamat contoh yang aman, serta tidak adanya hero/section penjualan. Beberapa temuan kontras teks dan hierarki heading yang relevan sudah diperbaiki. Status gate pemasaran tersebut tidak disamakan dengan hasil verifikasi fungsi dan responsivitas di atas.
