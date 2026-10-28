# IMPLEMENTATION_PLAN — Sistem Informasi Pembayaran SPP MA Darul Ihya

- Versi: 1.0 | Status: Rencana baseline disetujui; **belum mulai coding**
- Acuan: `PRD.md` dan `UI-GUIDELINE.md`
- Stack: React + Vite, JavaScript, data dummy, frontend-only

## 1. Tujuan
Membangun prototipe UI interaktif untuk memvalidasi alur admin/bendahara. Semua perilaku berjalan di sisi frontend dan tidak membutuhkan layanan eksternal.

## 2. Prinsip Eksekusi
- SOT adalah kontrak utama; jika instruksi lain bertentangan, ikuti SOT dan minta klarifikasi.
- Jangan menambah backend, database, API, autentikasi nyata, atau integrasi WhatsApp sungguhan.
- Data dummy terpusat; turunan dashboard, riwayat, dan tunggakan dihitung dari sumber yang sama.
- Kerjakan fase berurutan. Setelah tiap fase, laporkan perubahan, pengujian, dan file yang dibuat; tunggu persetujuan sebelum fase berikutnya.
- Tidak memulai implementasi hanya karena dokumen ini ada. Minta persetujuan eksplisit untuk Phase 1 coding.

## 3. Target Teknologi
- React + Vite, JavaScript.
- CSS terstruktur dengan CSS variables dari UI-GUIDELINE.
- React Router bila diperlukan untuk navigasi halaman.
- Lucide React untuk ikon.
- Recharts opsional untuk grafik.
- `xlsx`/`jspdf` hanya jika ekspor Excel/PDF benar-benar diimplementasikan dan diuji. Minimalkan dependensi.

## 4. Struktur Target
```text
ma-darul-ihya-spp/
├── public/
├── src/
│   ├── app/                 # App dan routing
│   ├── components/
│   │   ├── layout/          # AdminLayout, Sidebar, Topbar, PageHeader
│   │   ├── ui/              # Button, Input, Select, Badge, Card, Table, Modal, Toast
│   │   └── charts/          # grafik dashboard
│   ├── pages/               # Login, Dashboard, Students, Classes, SPP, Payments, History, Arrears, WhatsApp, Reports, Settings
│   ├── data/                # seed data dummy dan template pesan
│   ├── utils/               # format mata uang/tanggal dan kalkulasi
│   └── styles/              # tokens dan global styles
├── AGENTS.md
├── EXECUTION_PROMPT.md
├── PRD.md
├── UI-GUIDELINE.md
├── IMPLEMENTATION_PLAN.md
└── README.md
```

## 5. Fase Implementasi
### Phase 0 — Setup dan fondasi
- Buat project Vite React dan struktur minimal.
- Terapkan token, font, layout dasar, routing, dan komponen reusable.
- Pastikan build awal berhasil.

**Gate:** tunjukkan struktur dan hasil build; tunggu persetujuan.

### Phase 1 — Layout dan login demo
- Login demo, logout, sidebar/topbar, responsive shell, navigasi semua halaman.
- Tidak mengklaim autentikasi server.

**Gate:** minta persetujuan sebelum data/halaman inti.

### Phase 2 — Data master dan dashboard
- Seed data dummy siswa, kelas, tarif, tagihan, transaksi, template pesan.
- Dashboard dan CRUD siswa/kelas/SPP.
- Fungsi hitung bersama untuk metrik.

**Gate:** demo konsistensi data dan CRUD; tunggu persetujuan.

### Phase 3 — Transaksi, riwayat, tunggakan
- Form transaksi dengan validasi dan konfirmasi.
- Sinkronisasi state untuk riwayat, tagihan, tunggakan, dashboard.
- Bukti pembayaran yang dapat dipratinjau/dicetak.

**Gate:** uji alur pembayaran lengkap; tunggu persetujuan.

### Phase 4 — WhatsApp simulasi, laporan, pengaturan
- Template dan log WhatsApp simulasi.
- Filter laporan dan ekspor/cetak sesuai kemampuan implementasi yang diuji.
- Pengaturan akun demo lokal.

**Gate:** tinjau keterbatasan simulasi dan output laporan.

### Phase 5 — QA dan finalisasi
- Uji navigasi, form, CRUD, filter, perhitungan, responsif, empty/error states.
- Jalankan `npm run build`; perbaiki error.
- Perbarui README dengan setup, akun demo, batasan.

**Gate:** laporkan checklist QA dan minta persetujuan selesai.

### Phase 6 — Penyelarasan visual high-fidelity
- Selaraskan seluruh UI dengan brief desain terbaru: palet hijau-putih, sidebar hijau tua, topbar terang, tipografi dan komponen konsisten.
- Rapikan hierarki visual dashboard, halaman data, formulir, laporan, dan login tanpa mengubah aturan bisnis atau menambah dependensi.
- Pastikan pola navigasi dan layout tetap nyaman pada desktop dan perangkat kecil.
- Gunakan data fiktif yang sudah ada dan pertahankan label simulasi WhatsApp.

**Gate:** tinjau hasil visual seluruh halaman dan build produksi; tunggu persetujuan untuk perubahan lanjutan.

## 6. Sumber Data dan Aturan
- Gunakan satu sumber state/data dummy untuk entitas terkait.
- Tagihan unik berdasarkan siswa + periode + tahun ajaran.
- Nilai nominal historis disimpan pada tagihan yang terbentuk.
- Jangan hardcode nilai metrik terpisah dari transaksi/tagihan.
- Nomor WA dan identitas hanya data fiktif.

## 7. Checklist QA
- [ ] `npm install` berhasil.
- [ ] `npm run dev` membuka aplikasi.
- [ ] `npm run build` selesai tanpa error.
- [ ] Login demo/logout dan navigasi berjalan.
- [ ] CRUD memberi feedback dan validasi.
- [ ] Transaksi memperbarui dashboard, riwayat, dan tunggakan.
- [ ] Filter/pencarian sesuai data.
- [ ] Bukti pembayaran dapat dipratinjau/dicetak atau batasannya dijelaskan.
- [ ] WhatsApp selalu dilabeli simulasi.
- [ ] Ekspor benar-benar menghasilkan file jika tombol aktif.
- [ ] Layout dapat digunakan desktop/tablet/mobile.
- [ ] Tidak ada layanan eksternal atau scope tambahan.

## 8. Definition of Done
Semua halaman PRD tersedia, alur demo inti berjalan, data terkait konsisten, UI sesuai guideline, build produksi berhasil, README lengkap, dan semua batasan simulasi dinyatakan jelas.
