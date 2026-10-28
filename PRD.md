# PRD — Sistem Informasi Pembayaran SPP MA Darul Ihya

- Versi: 1.0 | Status: **Baseline disetujui untuk prototipe frontend**
- Produk: Sistem Informasi Pembayaran SPP Berbasis Web Terintegrasi WhatsApp Gateway Menggunakan Prototyping
- Target: admin/bendahara MA Darul Ihya
- Stack: React + Vite; frontend-only; data dummy

## 1. Ringkasan
Prototipe web membantu bendahara melihat kondisi pembayaran SPP, mengelola data siswa/kelas/tarif, mencatat pembayaran, memantau tunggakan, mengelola simulasi notifikasi WhatsApp, dan menyajikan laporan. Tujuan tahap ini adalah memvalidasi alur dan UI sebelum integrasi backend.

## 2. Masalah dan Tujuan
Administrasi pembayaran membutuhkan data siswa dan pembayaran yang mudah dicari, status pelunasan yang konsisten, penghitungan tunggakan yang mudah diperiksa, bukti transaksi, dan cara menyusun laporan. Sistem menempatkan data pembayaran dan statusnya dalam satu antarmuka.

Tujuan terukur prototipe:
- Pengguna dapat menemukan siswa melalui pencarian/filter.
- Pencatatan pembayaran demo memperbarui riwayat, ringkasan dashboard, dan status tagihan secara konsisten.
- Bendahara dapat memeriksa tunggakan serta memfilter laporan.
- Alur WhatsApp dapat didemokan dengan label **Simulasi**, tanpa mengirim pesan nyata.
- Seluruh menu inti dapat dicoba di desktop dan layar kecil.

## 3. Pengguna dan Hak Akses
**Admin/Bendahara** adalah satu-satunya persona pada prototipe. Login hanya simulasi sisi frontend; jangan menganggapnya sebagai autentikasi aman. Tidak ada portal siswa/orang tua.

## 4. Lingkup Fitur
### 4.1 Login dan navigasi
- Login demo dan logout.
- Layout admin dengan sidebar, topbar, judul halaman, dan area konten.

### 4.2 Dashboard
- Kartu: Total Siswa, Pembayaran Bulan Ini, Sudah Membayar, Belum Membayar, Total Tunggakan.
- Grafik pemasukan per bulan.
- Daftar pembayaran terbaru.
- Ringkasan status notifikasi WhatsApp.
- Semua angka dihitung dari data dummy terpusat, bukan angka yang diketik terpisah.

### 4.3 Data Siswa
- Daftar, cari, filter kelas, tambah, edit, lihat detail, dan hapus dengan konfirmasi.
- Data minimum: NIS, nama siswa, kelas, nomor WhatsApp orang tua, status.

### 4.4 Data Kelas
- Daftar kelas, tambah/edit/hapus dengan konfirmasi, dan jumlah siswa per kelas.

### 4.5 Data SPP
- Kelola nominal bulanan dan tahun ajaran.
- Perubahan tarif tidak mengubah nominal tagihan/transaksi historis yang sudah terbentuk.

### 4.6 Transaksi Pembayaran
- Pilih siswa dan periode tagihan, tampilkan nominal, masukkan tanggal dan jumlah bayar, lalu konfirmasi.
- Validasi field wajib, jumlah bayar positif, dan tagihan yang telah lunas tidak dibayar dua kali.
- Setelah tersimpan, perbarui riwayat, dashboard, tagihan, dan tunggakan.
- Sediakan pratinjau bukti pembayaran yang dapat dicetak melalui dialog print browser jika memungkinkan.

### 4.7 Riwayat Pembayaran
- Tampilkan nomor transaksi, tanggal, NIS/nama, kelas, periode SPP, nominal, dan status.
- Cari dan filter berdasarkan periode, kelas, serta status.
- Buka detail/bukti pembayaran.

### 4.8 Data Tunggakan
- Tampilkan siswa, kelas, periode belum dibayar, jumlah bulan tertunggak, dan total nominal.
- Filter kelas/periode; aksi pengingat membuka alur simulasi WhatsApp.
- Tunggakan berasal dari perbandingan tagihan dan pembayaran dummy.

### 4.9 WhatsApp Gateway
- Ringkasan dan daftar pesan: konfirmasi pembayaran, pengingat jatuh tempo, dan notifikasi tunggakan.
- Template pesan dapat dilihat dan diedit dalam state demo.
- Tombol kirim menjalankan simulasi dan memperbarui status demo.
- Status seperti “Terkirim (Simulasi)” atau “Gagal (Simulasi)” bukan bukti pengiriman nyata.
- Status pengiriman provider sesungguhnya, webhook, API key, dan pengiriman pesan nyata di luar lingkup.

### 4.10 Laporan dan ekspor
- Filter periode, kelas, dan siswa.
- Tabel ringkasan pembayaran sesuai filter.
- Sediakan cetak dan ekspor Excel/PDF hanya bila dapat benar-benar menghasilkan file pada prototipe; jika belum, tampilkan status/penjelasan yang jujur.

### 4.11 Pengaturan
- Perubahan username/password demo pada state lokal saja.
- Tidak ada penyimpanan kredensial server.

## 5. Navigasi Utama
1. Dashboard
2. Data Siswa
3. Data Kelas
4. Data SPP
5. Transaksi Pembayaran
6. Riwayat Pembayaran
7. Data Tunggakan
8. WhatsApp Gateway
9. Laporan Pembayaran
10. Pengaturan
11. Logout

## 6. Aturan Bisnis
- Periode tagihan diidentifikasi dengan siswa + bulan + tahun ajaran.
- Satu tagihan tidak boleh ditandai lunas lebih dari sekali.
- Pembayaran bulan berjalan dihitung dari transaksi dengan tanggal dalam bulan berjalan yang ditentukan oleh data demo.
- Sudah Membayar/Belum Membayar dihitung berdasarkan status tagihan pada periode dashboard.
- Total tunggakan adalah jumlah nominal sisa tagihan yang belum lunas; hindari hitung ganda dari riwayat transaksi.
- Tarif historis melekat pada tagihan yang telah dibuat.
- Data dummy harus konsisten di seluruh halaman dan perhitungan.

## 7. Kebutuhan Nonfungsional
- Bahasa antarmuka Indonesia, format Rupiah `Rp1.250.000`, tanggal mudah dibaca.
- Layout responsif, navigasi keyboard dasar, label form jelas, status tidak dibedakan hanya dengan warna.
- Feedback sukses/gagal, validasi form, konfirmasi aksi destruktif, empty state, dan state pencarian kosong.
- Tidak menampilkan data pribadi nyata; gunakan nama/NIS/nomor kontak fiktif.

## 8. Di Luar Lingkup
Backend, database, API, autentikasi/otorisasi nyata, WhatsApp Gateway provider sungguhan, deployment, multi-role, portal orang tua/siswa, pembayaran online, dan integrasi eksternal apa pun. Jangan menambah fitur tanpa persetujuan.

## 9. Kriteria Penerimaan
- Seluruh menu pada daftar navigasi dapat dibuka.
- CRUD data demo memberi feedback dan validasi.
- Transaksi memperbarui riwayat, dashboard, dan tunggakan secara konsisten.
- Pencarian/filter menghasilkan data yang sesuai.
- Bukti transaksi dapat dipratinjau dan dicetak atau keterbatasannya dinyatakan.
- WhatsApp jelas berlabel simulasi.
- UI mengikuti UI-GUIDELINE; build produksi berhasil.
- README menjelaskan cara menjalankan dan keterbatasan prototipe.

## 10. Gerbang Persetujuan
Baseline ini mengizinkan **persiapan dokumen dan rencana** saja. Implementasi React tidak dimulai otomatis; perlu persetujuan eksplisit terpisah setelah paket SOT ditinjau.
