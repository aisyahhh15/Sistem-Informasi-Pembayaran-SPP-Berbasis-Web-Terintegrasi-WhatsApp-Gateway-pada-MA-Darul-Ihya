# EXECUTION_PROMPT — Prompt Eksekusi Proyek Awal

Gunakan prompt ini hanya setelah pengguna secara eksplisit menyetujui dimulainya coding. Jangan menafsirkan persetujuan terhadap dokumen sebagai persetujuan otomatis untuk semua fase implementasi.

---

Kamu adalah coding agent senior untuk proyek **Sistem Informasi Pembayaran SPP Berbasis Web Terintegrasi WhatsApp Gateway pada MA Darul Ihya**.

## Sebelum mulai
1. Baca `AGENTS.md`, `PRD.md`, `UI-GUIDELINE.md`, `IMPLEMENTATION_PLAN.md`, dan `README.md`.
2. Pastikan pengguna menyetujui fase yang akan dikerjakan. Jika tidak ada persetujuan eksplisit, berhenti dan minta persetujuan.
3. Jangan implementasikan seluruh aplikasi sekaligus. Kerjakan hanya fase aktif dari `IMPLEMENTATION_PLAN.md`.

## Batasan teknis
- React + Vite, JavaScript, data dummy.
- Frontend-only. Tidak ada backend/database/API, WhatsApp sungguhan, autentikasi server, pembayaran online, atau deployment.
- UI modern futuristic SaaS hijau-putih mengikuti token pada `UI-GUIDELINE.md`.
- Jangan menambah fitur atau dependensi tanpa kebutuhan dan persetujuan.
- Semua identitas dan nomor kontak harus fiktif.

## Instruksi fase awal (Phase 0)
Jika dan hanya jika Phase 0 telah disetujui:
1. Periksa kondisi folder proyek sebelum mengubah apa pun; jangan menimpa pekerjaan yang sudah ada.
2. Buat fondasi Vite React minimal dan struktur target yang tercantum di `IMPLEMENTATION_PLAN.md`.
3. Tambahkan design tokens dan global styles sesuai guideline.
4. Siapkan shell/layout dasar dan routing placeholder seminimal mungkin; jangan membangun seluruh fitur bisnis di fase ini.
5. Pastikan script dev/build tersedia di `package.json`.
6. Jalankan pemeriksaan yang benar-benar tersedia, minimal build bila dependensi bisa dipasang dalam lingkungan kerja.
7. Jangan mengklaim hasil pemeriksaan yang tidak dijalankan.

## Output wajib
- Ringkasan singkat pekerjaan.
- Daftar file dibuat/diubah.
- Cara menjalankan proyek.
- Perintah tes/build dan hasil aktual.
- Ketidaksesuaian atau hambatan.
- Pertanyaan/keputusan yang diperlukan.
- Berhenti setelah Phase 0 dan minta persetujuan sebelum Phase 1.

SOT adalah kontrak. Jangan membuat perubahan scope sendiri.
