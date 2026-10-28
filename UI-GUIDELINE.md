# UI-GUIDELINE — Sistem Informasi Pembayaran SPP MA Darul Ihya

- Versi: 1.0 | Status: Baseline desain disetujui
- Arah: modern futuristic SaaS, profesional, hijau + putih
- Target: admin/bendahara | React + Vite | frontend-only

## 1. Prinsip
1. **Modern SaaS:** bersih, terstruktur, berorientasi data.
2. **Futuristik secukupnya:** aksen hijau, grafik ringkas, ikon konsisten, elevasi halus; hindari neon/glassmorphism berlebihan.
3. **Data-first:** nominal, tanggal, periode, dan status mudah dipindai.
4. **Efisien:** pembayaran, pencarian siswa, dan tunggakan mudah dijangkau.
5. **Aksesibel dan responsif:** warna bukan satu-satunya indikator; semua form berlabel.

## 2. Design Tokens
| Token | Nilai | Pemakaian |
|---|---|---|
| primary-700 | `#11663A` | hover/active utama |
| primary-600 | `#16834A` | tombol utama, link aktif |
| primary-500 | `#22A45A` | grafik/aksen |
| primary-100 | `#DDF5E6` | latar badge/aksen |
| primary-50 | `#F0FBF4` | sorotan ringan |
| page-bg | `#F7F9F8` | latar aplikasi |
| surface | `#FFFFFF` | kartu, tabel, modal |
| text-primary | `#17211B` | teks utama |
| text-secondary | `#647168` | metadata |
| border | `#E2E9E4` | border/divider |
| danger | `#C83D4D` | aksi destruktif/gagal |
| warning | `#B7791F` | jatuh tempo/perhatian |
| success | `#16834A` | status sukses |

Gunakan CSS variables untuk token. Pastikan kontras teks dan tombol memadai.

## 3. Tipografi dan Spasi
- Font sans-serif modern: `Inter` jika tersedia, fallback `system-ui, sans-serif`.
- Judul halaman 24–30 px desktop; subjudul 14–16 px; tabel/form 13–15 px.
- Skala spasi 4/8/12/16/24/32 px.
- Radius kartu 14–18 px; input/tombol 10–12 px.
- Bayangan ringan dan border tipis; hindari ornamen yang mengganggu keterbacaan.

## 4. Layout Aplikasi
- Desktop: sidebar kiri sekitar 248 px, topbar, konten dengan lebar nyaman.
- Sidebar: logo/wordmark MA Darul Ihya, menu, penanda aktif, area logout di bawah.
- Topbar: judul konteks/breadcrumb seperlunya, periode atau pencarian bila relevan, profil Admin Demo.
- Mobile: sidebar menjadi drawer/toggle; tabel boleh horizontal-scroll atau berubah menjadi kartu; aksi utama tidak boleh terpotong.
- Halaman login terpisah dengan identitas sekolah dan penanda “Mode demo”.

## 5. Pola Komponen
- `Button`: primary, secondary, ghost, danger; loading/disabled jelas.
- `Card` dan `StatCard`: label, angka, ikon, deskripsi periode bila diperlukan.
- `DataTable`: header konsisten, sort bila diperlukan, pencarian/filter, empty state, pagination hanya bila berguna.
- `Badge`: teks status plus warna/ikon; contoh Lunas, Belum Bayar, Terkirim (Simulasi), Gagal (Simulasi).
- `FormField`: label, helper/error text, validasi yang mudah dipahami.
- `Modal/Drawer`: untuk tambah/edit/detail; konfirmasi sebelum hapus.
- `Toast/Inline feedback`: hasil tindakan yang jelas.
- `PageHeader`: judul, penjelasan singkat, satu aksi utama.

## 6. Arahan per Halaman
- **Login:** username/password, tombol masuk, akun demo yang dijelaskan, label autentikasi simulasi.
- **Dashboard:** lima kartu metrik; grafik pemasukan bulanan; pembayaran terbaru; ringkasan WhatsApp.
- **Data Siswa:** tombol Tambah Siswa, pencarian, filter kelas, tabel NIS/nama/kelas/WA orang tua/status/aksi.
- **Data Kelas:** nama kelas, wali kelas bila ada di dummy, jumlah siswa, aksi.
- **Data SPP:** tahun ajaran, nominal per bulan, status konfigurasi.
- **Transaksi:** pilih siswa/periode, tampilkan tagihan, nominal dan tanggal, ringkasan sebelum konfirmasi.
- **Riwayat:** nomor transaksi, tanggal, siswa, kelas, periode, nominal, status; detail bukti.
- **Tunggakan:** siswa, kelas, periode tertunggak, jumlah bulan, total, aksi pengingat.
- **WhatsApp Gateway:** kartu status simulasi, daftar pesan, template, status dan waktu simulasi.
- **Laporan:** filter periode/kelas/siswa, ringkasan total, tabel, tombol cetak/ekspor.
- **Pengaturan:** kredensial demo dan penjelasan bahwa perubahan hanya lokal.

## 7. Interaksi dan Microcopy
- Bahasa Indonesia ringkas dan ramah profesional.
- Label aksi spesifik: “Simpan Pembayaran”, “Tambah Siswa”, “Kirim Simulasi”, “Unduh Laporan”.
- Format uang: `Rp1.250.000`; tanggal tampilan: `09 Okt 2026`.
- Jangan gunakan tombol yang tidak berfungsi tanpa keterangan.
- Aksi hapus perlu konfirmasi; form perlu validasi; aksi sukses/gagal perlu feedback.
- Status WA selalu memuat kata “Simulasi” selama belum terhubung ke provider nyata.

## 8. Motion dan Ikon
- Transisi 150–220 ms, hanya untuk state hover/focus/modal/sidebar.
- Hormati preferensi reduced motion jika implementasi memungkinkan.
- Satu library ikon, misalnya Lucide React. Ikon harus membantu pemahaman, bukan dekorasi saja.

## 9. Responsif dan Aksesibilitas
- Target tap minimal sekitar 44 × 44 px.
- Fokus keyboard terlihat, label terkait dengan input, modal dapat ditutup dengan cara yang jelas.
- Jangan menyampaikan status hanya melalui warna.
- Di layar kecil, utamakan tugas utama dan hindari horizontal overflow halaman; scroll tabel dibatasi pada area tabel.

## 10. Kriteria Penerimaan Visual
- Warna hijau-putih dan token konsisten di semua halaman.
- Sidebar/topbar konsisten dan menu aktif mudah dikenali.
- Kartu, tabel, form, badge, dan modal memakai pola yang sama.
- Data dummy konsisten antarkomponen.
- Desktop, tablet, dan mobile dapat digunakan.
- Tidak ada klaim autentikasi, database, atau pengiriman WhatsApp sungguhan.
