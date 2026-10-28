# AGENTS.md — Kontrak Kerja Coding Agent

## Otoritas dan Prioritas
1. `PRD.md` menentukan lingkup, kebutuhan, aturan bisnis, dan penerimaan.
2. `UI-GUIDELINE.md` menentukan desain, komponen, responsif, dan interaksi.
3. `IMPLEMENTATION_PLAN.md` menentukan fase, urutan, dan gerbang persetujuan.
4. `AGENTS.md` mengatur perilaku agent; `EXECUTION_PROMPT.md` memulai satu fase yang diminta.

Jika ada konflik atau ambiguitas yang memengaruhi lingkup, jangan menebak: jelaskan dan minta keputusan pengguna.

## Aturan Wajib
- Implementasi hanya React + Vite dengan data dummy frontend-only sampai ada persetujuan baru.
- Jangan membuat backend, database, API, autentikasi nyata, integrasi WhatsApp nyata, pembayaran online, atau deployment.
- Jangan menambah fitur/menu/dependensi besar tanpa alasan dan persetujuan.
- Gunakan data dummy fiktif; jangan masukkan data pribadi nyata.
- Jaga satu sumber data/state dan fungsi kalkulasi bersama untuk pembayaran, riwayat, dashboard, serta tunggakan.
- Pertahankan nominal historis pada tagihan yang sudah terbentuk.
- Semua tombol harus bekerja, menampilkan feedback, atau secara eksplisit dinonaktifkan dengan alasan.
- Seluruh status WhatsApp wajib menyebut simulasi selama belum terhubung ke provider.
- Ikuti design tokens, komponen, format Rupiah/tanggal, aksesibilitas, dan breakpoint pada UI-GUIDELINE.
- Hindari refactor di luar kebutuhan fase aktif.
- Jangan menghapus file atau mengubah kontrak SOT tanpa menjelaskan dan meminta persetujuan.

## Alur Kerja per Fase
1. Baca seluruh SOT sebelum coding.
2. Identifikasi tujuan fase aktif dan file yang akan disentuh.
3. Implementasikan hanya ruang lingkup fase itu.
4. Jalankan pemeriksaan yang tersedia dan catat hasil sebenarnya.
5. Laporkan file/perubahan, cara uji, hasil, keterbatasan, dan keputusan yang dibutuhkan.
6. Berhenti dan tunggu persetujuan eksplisit sebelum fase berikutnya.

## Standar Kualitas
- Komponen reusable untuk tombol, field, badge, kartu, tabel, modal, toast, dan empty state jika relevan.
- Penamaan jelas, fungsi kecil, format uang/tanggal terpusat.
- Form berlabel dan tervalidasi; aksi destruktif dikonfirmasi.
- Empty state, error state, feedback, fokus keyboard, dan layout mobile diperhatikan.
- Jangan menyatakan pengujian/build berhasil kecuali benar-benar dijalankan dan hasilnya tersedia.

## Pelaporan
Pada akhir fase, laporkan:
- Status fase dan cakupan yang selesai.
- Daftar file yang dibuat/diubah.
- Perintah pemeriksaan yang dijalankan dan hasil aktual.
- Hal yang belum selesai atau asumsi.
- Permintaan persetujuan eksplisit untuk lanjut.
