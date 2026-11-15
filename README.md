# Sistem Informasi Pembayaran SPP — MA Darul Ihya

Prototipe frontend untuk membantu admin/bendahara melihat data siswa, tarif, tagihan, transaksi, tunggakan, laporan, serta alur notifikasi WhatsApp simulasi.

## Menjalankan aplikasi

Persyaratan: Node.js dan npm.

```bash
npm install
npm run dev
```

Untuk build produksi lokal:

```bash
npm run build
npm run preview
```

## Akun demo

- **Admin:** username `admin`, password `admin123`.
- **Tata Usaha:** username `tu`, password `tu12345`.
- Admin dapat membuat, mengubah, dan menghapus akun Tata Usaha di menu **Pengaturan & Kelola Akun**. Kredensial Admin dapat diubah di halaman yang sama.
- Akun TU dapat membuka Dashboard, Data Siswa, Transaksi Pembayaran, Riwayat Pembayaran, Data Tunggakan, dan Laporan Pembayaran. Data Kelas, Data SPP, WhatsApp Gateway, dan Pengaturan hanya tersedia bagi Admin.
- Akun demo disimpan di `localStorage` agar perubahan bisa dicoba antar sesi browser. Kata sandi disimpan sebagai data demo yang tidak aman; ini bukan autentikasi nyata dan jangan gunakan kata sandi pribadi.

## Cakupan prototipe

- Login demo Admin/TU, menu dan route sesuai role, konfirmasi logout, navigasi sidebar, dan layout responsif.
- Seed 87 siswa fiktif, tiga tingkat kelas (X, XI, XII), dan 23 tenaga pendidik demo.
- Dashboard, pencarian serta CRUD siswa, kelas, dan tarif SPP.
- Pencatatan transaksi penuh atau sebagian dengan metode Tunai atau Transfer Bank; riwayat, pratinjau bukti, dan dialog cetak browser.
- Kuitansi mencantumkan terbilang, metode pembayaran, bendahara, dan tanggal cetak.
- Rekap tunggakan dari sisa tagihan.
- Template dan log WhatsApp berstatus **Simulasi**; aplikasi tidak mengirim pesan.
- Filter laporan menurut tanggal, bulan, tahun ajaran, kelas, dan siswa; cetak browser dan unduh CSV dari data terfilter.
- Pengaturan nama/email profil, kredensial Admin, dan CRUD akun TU di `localStorage` browser.

Data awal dan semua identitas/nomor kontak adalah fiktif. Perubahan data demo disimpan di `localStorage` browser agar bertahan setelah muat ulang. Logout meminta konfirmasi sebelum mengakhiri sesi demo. Periode dashboard demo ditetapkan ke Oktober 2026.

## Batasan

Aplikasi ini tidak memakai backend, database, API, autentikasi server, pembayaran online, provider WhatsApp, maupun deployment. Status WhatsApp adalah catatan simulasi dan bukan bukti pesan terkirim. File CSV dibuat oleh browser; cetak memakai dialog print browser. Ekspor Excel/PDF khusus belum tersedia; tombol simulasi menjelaskan batasannya dan memberi petunjuk memakai CSV/cetak browser.

## Pemeriksaan

Build produksi terakhir dijalankan dengan `npm run build` menggunakan Vite 5.4.21 dan berhasil. Belum ada suite tes otomatis atau pemeriksaan interaksi browser dalam paket ini.

Dokumen `PRD.md`, `UI-GUIDELINE.md`, `IMPLEMENTATION_PLAN.md`, dan `AGENTS.md` tetap menjadi sumber lingkup dan aturan implementasi.
