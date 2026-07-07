# Whats-CS AI WhatsApp Sales Assistant - Roadmap & Changelog

## 1. Project Goal
AI WhatsApp Assistant yang terintegrasi dengan CRM Dashboard untuk Loyal Fitness. Memungkinkan tim untuk menjawab chat secara otomatis, melakukan scoring lead secara instan, mendeteksi kualifikasi calon member (target, minat, lokasi), dan melakukan handover manual/otomatis ke CS manusia apabila lead bertaraf Hot (score >= 70).

---

## 2. Changelog & Checkpoints

### [2026-07-05] - Project Initialization & Webhook Simulator Setup
* **Deskripsi:** Inisialisasi proyek dan pengembangan CRM Dashboard beserta simulator WhatsApp Webhook.
* **Perubahan Utama:**
  * **Scaffolding:** Membuat kerangka aplikasi Laravel 11 + React + Inertia + Tailwind CSS v3.
  * **Database & Migrations:** Membuat migrasi untuk tabel `promos` (knowledge base), `leads` (informasi calon member), `conversations` (riwayat obrolan), dan `handovers` (log penyerahan ke CS).
  * **Models:** Membuat model Eloquent `Promo`, `Lead`, `Conversation`, dan `Handover`.
  * **Seeder:** Menyiapkan `DatabaseSeeder` dengan akun default Owner (`test@example.com`), CS Agent (`marketing@example.com`), dan 3 contoh promo gym aktif untuk basis pengetahuan awal AI.
  * **AI & NLP Engine (`AiService.php`, `OpenAiService.php`, `GeminiService.php`, `WebReaderService.php`):** 
    * Membuat parser OpenAI API (GPT-4o-mini) & Gemini API (1.5 Flash).
    * Mengimplementasikan Unified AI Gateway yang mendeteksi tersedianya API Key secara otomatis dengan fallback NLP lokal.
    * **SSL Bypass untuk Local Dev:** Menambahkan `Http::withoutVerifying()` pada request API OpenAI dan Gemini untuk menghindari kegagalan koneksi cURL Error 60 (masalah sertifikat SSL lokal pada PHP Windows).
    * **Dynamic Context Injection:** Menyuntikkan konfigurasi profil bisnis (Nama PT, Nama Gym, Alamat Gym) dan tautan website resmi (loyalfitness.id & solusimitramandiri.com) dari database secara dinamis ke dalam prompt system AI.
    * **Web Reader Service (Jina Reader Integration):** Membuat [WebReaderService.php](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/app/Services/WebReaderService.php) yang mengambil, membatasi panjang teks (max 4.000 karakter), dan menyisipkan konten bersih dari halaman landing page loyalfitness.id dan solusimitramandiri.com ke prompt asisten AI dengan cache 12 jam. Menggunakan proxy open-source **Jina Reader (r.jina.ai)** untuk mengubah visual web HTML menjadi Markdown terstruktur rapi demi keakuratan pemahaman teks AI yang lebih tinggi (dilengkapi pembersihan cache otomatis saat tautan diubah di dasbor).
  * **Webhook & Baileys Gateway (`WhatsAppController.php`, `whatsapp-gateway/`):** 
    * Mengembangkan logic pemrosesan webhook WA (/api/whatsapp/webhook) yang dikecualikan dari verifikasi CSRF di `bootstrap/app.php`.
    * Memisahkan engine utama menjadi `processIncomingMessage` agar dapat dibagikan oleh simulator dan webhook asli.
    * Membuat script Node.js Baileys (`gateway.js` & `package.json` di subfolder `whatsapp-gateway/`) untuk menghubungkan nomor WA sungguhan via scan QR, mengunggah ke Laravel, dan membalas secara lokal gratis.
    * **Delay Timer (Anti-Spam):** Mengintegrasikan simulasi status "typing..." WhatsApp dan jeda waktu kirim dinamis (2.5s - 6s) agar bot tidak terindikasi sebagai spammer oleh server WhatsApp.
    * **Gateway Status Heartbeat:** Mengintegrasikan pengiriman sinyal keaktifan (*heartbeat status*) berkala dari Baileys daemon ke Laravel Cache yang terupdate otomatis di CRM Dashboard.
    * **Handover Wording Naming:** Menyesuaikan istilah penyerahan CS dari sebutan umum "Tim CS/Marketing" menjadi khusus **"Membership Consultant"** pada prompt asisten AI dan template balasan penutupan otomatis (*handover message*) sesuai masukan langsung dari Stakeholder.
    * **REST API Gateway & Auto-Followup:** 
      * Menambahkan HTTP REST API server bawaan Node.js di `gateway.js` (port `3000`) agar Laravel bisa menembak pesan keluar secara asinkronus (`/api/send`).
      * Mengimplementasikan auto-followup jika **Customer menggantung chat selama 1 jam** tanpa balasan (dibatasi maksimal 1x follow-up per sesi tidak aktif).
      * Menyediakan parameter `?debug=true` pada route `/api/whatsapp/check-followup` agar waktu tunggu follow-up terpangkas menjadi 2 menit saja demi kemudahan pengujian developer.
  * **CRM Dashboard & Settings Page (`Dashboard.jsx`, `Settings/Index.jsx`, `AdminLayout.jsx`):**
    * Panel atas berisi widget status Cold/Warm/Hot Leads, serta **indikator status koneksi Baileys Gateway (Online/Offline) dengan polling otomatis setiap 10 detik**.
    * **AI Config Dashboard:** Membangun antarmuka manajemen baru [Settings/Index.jsx](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/resources/js/Pages/Settings/Index.jsx) untuk merubah Nama PT, Alamat Gym, link Website Utama, dan Link ERP Aplikasi secara real-time.
    * Panel kiri berupa daftar obrolan aktif beserta skor dan CS yang memegang kendali.
    * Panel tengah berupa **WhatsApp Simulator** interaktif dengan bubble stream berwarna hijau-hijau aksen Level dan form input pengiriman pesan.
    * Panel kanan berisi detail kualifikasi AI (Goal, Interest, Domisili), penetapan CS, dan perubahan status manual.
  * **Promo CRUD (`Promos/Index.jsx`):** Membuat panel manajemen CRUD untuk basis data promo Loyal Fitness terintegrasi dengan `<ConfirmModal />`.
  * **Reusable Components & Layout:** 
    * Membuat `AdminLayout.jsx` bertema warm dark Level.
    * Membuat `ConfirmModal.jsx` (alert konfirmasi bergaya Level).
    * Membuat `Card.jsx` (pembungkus panel melayang bertema warna pastel).
  * **Server Launch:** Menjalankan background task `php artisan serve` (port 8000) dan `npm run dev` (Vite).
* **File Utama:**
  * [database/migrations/2026_07_05_100000_create_whatsapp_assistant_tables.php](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/database/migrations/2026_07_05_100000_create_whatsapp_assistant_tables.php)
  * [app/Services/AiService.php](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/app/Services/AiService.php)
  * [app/Services/OpenAiService.php](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/app/Services/OpenAiService.php)
  * [app/Http/Controllers/WhatsAppController.php](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/app/Http/Controllers/WhatsAppController.php)
  * [whatsapp-gateway/gateway.js](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/whatsapp-gateway/gateway.js)
  * [resources/js/Pages/Dashboard.jsx](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/resources/js/Pages/Dashboard.jsx)
  * [resources/js/Pages/Promos/Index.jsx](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/resources/js/Pages/Promos/Index.jsx)

### [2026-07-07] - Production VPS Deployment, Chatbot Adjustments & AI Audit
* **Deskripsi:** Deployment sistem Whats-CS ke server VPS produksi, penyesuaian alur chat bot (Fitday/Loyal Fitness), optimasi logika handover AI, perbaikan SSL, dan pemolesan menyeluruh desain UI back office.
* **Perubahan Utama:**
  * **AI & Chatbot Workflow Adjustments:**
    * **Dynamic Hour Greeting:** AI kini menyapa customer dengan salam dinamis ("Selamat Pagi/Siang/Sore/Malam") berdasarkan jam lokal server saat pesan pertama diterima.
    * **Strict Pricing Spill Restriction:** AI tidak lagi membeberkan rincian harga penuh/promo secara langsung di awal. AI hanya menginfokan tarif keanggotaan awal (mulai dari Rp 240.000-an/bulan) dengan durasi paket 3, 6, atau 12 bulan.
    * **Dynamic Naming & Inquiry:** AI memperkenalkan diri sebagai Asisten Resmi dan langsung menanyakan nama serta target olahraga calon member ("Dengan kakak siapa dan goals latihannya apa?").
    * **Visit Invitation:** Menyisipkan undangan (invitation) ramah agar calon member visit/tour fisik ke gym untuk konsultasi dan uji alat gratis.
    * **AI Silencer (Mute):** Menghentikan loop pengulangan chat handover dengan melacak status lead (`Handover to CS`). Sekarang AI otomatis bisu (silent) saat penanganan diambil alih oleh CS manusia, mencegah chat otomatis mengganggu negosiasi CS.
    * **Model Upgrade:** Meningkatkan model OpenAI ke flagship **GPT-4o** untuk pemahaman kontekstual bahasa Indonesia/Palembang yang lebih presisi, dengan efisiensi biaya token yang lebih baik.
    * **Gemini Patch:** Memperbaiki kesalahan ketik endpoint domain Gemini API ke `generativelanguage.googleapis.com` dan meningkatkan versi ke **Gemini 2.0 Flash** untuk performa fallback yang unggul.
  * **cPanel Apache VPS Deployment & System Patch:**
    * **Symlink Document Root:** Menyelesaikan error loop 10 redirect Apache dengan menghubungkan folder cPanel `public_html/crm.loyalfitness.id` menggunakan symbolic link (`ln -s`) langsung ke root project di VPS.
    * **PHP 8.4 Activation:** Memaksa penggunaan versi PHP ea-php84 di Apache subdomain dengan mendaftarkan script handler di berkas `.htaccess`.
    * **SSL cURL Error 60 Patch:** Memasang bundel sertifikat CA (`cacert.pem`) pada setelan `curl.cainfo` dan `openssl.cafile` di config `php.ini` PHP 8.4 VPS untuk kelancaran request API OpenAI.
    * **PM2 Process Daemon:** Mengaktifkan daemon gateway via PM2 dengan auto-start systemd dan session restore yang aman.
  * **Aesthetics Redesign & Brand Assets:**
    * **Favicon & Logo Baru:** Menggenerasikan logo monogram **LF** bertema warm orange dan dark charcoal satin menggunakan generator AI, lalu memasangnya sebagai logo login dan favicon sistem.
    * **Login & GuestLayout Redesign:** Merombak tampilan otentikasi login dengan gaya gelap premium, efek glassmorphic, input label dengan Phosphor icons, dan tombol toggle password.
    * **Profile Redesign:** Mematangkan visual [Edit.jsx](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/resources/js/Pages/Profile/Edit.jsx) profil terintegrasi penuh di dalam layout dasbor dengan grid gelap bergaya Level.
  * **Dashboard & Chatbot Features:**
    * **Real-time QR Code Display:** Implementasi penampilan QR Code otentikasi WhatsApp secara langsung pada Dashboard CRM saat status gateway terputus (Offline). CS tidak perlu lagi membuka terminal SSH VPS untuk melakukan pemindaian (scanning).
    * **Root Route Redirect:** Mengubah rute halaman utama `/` agar otomatis mengarahkan (redirect) pengguna ke halaman login jika belum terotentikasi, atau langsung ke dashboard jika sudah login.
    * **Ironclad Chatbot Rules:** Memperketat SOP asisten AI (GPT-4o) untuk memblokir pembocoran harga lengkap/nama promo di awal chat walaupun ditanya langsung oleh pelanggan, serta memaksa listing semua promo aktif dari database tanpa filter.
    * **System Auto-Update UI Button:** Penambahan tombol "Jalankan Update Sistem" di halaman Settings admin panel yang memicu trigger skrip `whats-update.sh` di VPS via backend Laravel. Output konsol dari proses Git pull, database migration, npm compile, dan PM2 restart ditampilkan secara real-time di UI.
    * **Reset Riwayat Chat Lead:** Penambahan tombol "Reset Riwayat Chat" di panel profile sidebar lead pada Dashboard CRM. Ini secara instan menghapus seluruh log pesan percakapan lead tersebut dari database, memaksa bot AI untuk mengulang perkenalan SOP baru dari awal saat ada pesan baru masuk.
* **File Utama:**
  * [app/Http/Controllers/WhatsAppController.php](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/app/Http/Controllers/WhatsAppController.php)
  * [routes/web.php](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/routes/web.php)
  * [resources/js/Pages/Settings/Index.jsx](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/resources/js/Pages/Settings/Index.jsx)
  * [resources/js/Pages/Dashboard.jsx](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/resources/js/Pages/Dashboard.jsx)
  * [whatsapp-gateway/gateway.js](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/whatsapp-gateway/gateway.js)
  * [app/Services/OpenAiService.php](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/app/Services/OpenAiService.php)
  * [app/Services/GeminiService.php](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/app/Services/GeminiService.php)
  * [resources/js/Pages/Auth/Login.jsx](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/resources/js/Pages/Auth/Login.jsx)
  * [resources/js/Pages/Profile/Edit.jsx](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/resources/js/Pages/Profile/Edit.jsx)
  * [resources/js/Layouts/GuestLayout.jsx](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/resources/js/Layouts/GuestLayout.jsx)
  * [resources/views/app.blade.php](file:///C:/Users/Ki/Documents/WORKING/WORKING/GMY-MANAGEMENT/Whats-CS/resources/views/app.blade.php)

