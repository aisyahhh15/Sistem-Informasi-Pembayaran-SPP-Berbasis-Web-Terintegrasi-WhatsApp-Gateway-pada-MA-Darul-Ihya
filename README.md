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

- Username awal: `admin`
- Password awal: `admin123`

Kredensial demo dapat diubah di menu **Pengaturan**. Perubahan berlaku selama halaman tetap terbuka dan kembali ke nilai awal setelah reload. Login berjalan di frontend dan bukan autentikasi aman.

## Cakupan prototipe

- Login demo, navigasi sidebar, dan layout responsif.
- Seed 84 siswa fiktif, enam kelas, dan 23 tenaga pendidik demo.
- Dashboard, pencarian serta CRUD siswa, kelas, dan tarif SPP.
- Pencatatan transaksi penuh atau sebagian dengan metode Tunai, Transfer Bank, atau QRIS; riwayat, pratinjau bukti, dan dialog cetak browser.
- Kuitansi mencantumkan terbilang, metode pembayaran, bendahara, dan tanggal cetak.
- Rekap tunggakan dari sisa tagihan.
- Template dan log WhatsApp berstatus **Simulasi**; aplikasi tidak mengirim pesan.
- Filter laporan menurut tanggal, bulan, tahun ajaran, kelas, dan siswa; cetak browser dan unduh CSV dari data terfilter.
- Pengaturan nama/email profil yang disimpan lokal serta username/password demo di state sesi.

Data awal dan semua identitas/nomor kontak adalah fiktif. Perubahan data demo disimpan di `localStorage` browser agar bertahan setelah muat ulang; kredensial login berlaku selama sesi halaman. Periode dashboard demo ditetapkan ke Oktober 2026.

## Batasan

Aplikasi ini tidak memakai backend, database, API, autentikasi server, pembayaran online, provider WhatsApp, maupun deployment. Status WhatsApp adalah catatan simulasi dan bukan bukti pesan terkirim. File CSV dibuat oleh browser; cetak memakai dialog print browser. Ekspor Excel/PDF khusus belum tersedia; tombol simulasi menjelaskan batasannya dan memberi petunjuk memakai CSV/cetak browser.

## Pemeriksaan

Build produksi terakhir dijalankan dengan `npm run build` menggunakan Vite 5.4.21 dan berhasil. Belum ada suite tes otomatis atau pemeriksaan interaksi browser dalam paket ini.

Dokumen `PRD.md`, `UI-GUIDELINE.md`, `IMPLEMENTATION_PLAN.md`, dan `AGENTS.md` tetap menjadi sumber lingkup dan aturan implementasi.
