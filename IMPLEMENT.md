Bisa bro. Ini **modul urutan kerja AI WhatsApp Sales Assistant** buat tim IT lu.

## MODULE AI WHATSAPP SALES ASSISTANT

### 1. Tujuan Sistem

AI WhatsApp ini dibuat untuk:

* Menjawab chat calon member secara natural.
* Menjelaskan promo, fasilitas, kelas, lokasi, dan benefit gym.
* Menggali kebutuhan calon member sebelum closing.
* Menilai apakah calon member masih tanya-tanya atau sudah serius.
* Mengalihkan calon member serius ke CS/Marketing manusia.

---

## 2. Alur Utama Sistem

### Flow Besar

**Calon member chat WhatsApp**
↓
**AI menyapa & memahami kebutuhan**
↓
**AI menggali tujuan member**
↓
**AI menjelaskan promo/fasilitas sesuai kebutuhan**
↓
**AI menangani keberatan/ragu-ragu**
↓
**AI memberi lead score**
↓
**Jika serius → handover ke CS/Marketing**
↓
**CS/Marketing closing harga final & jadwal visit**

---

## 3. Modul Teknis yang Dibutuhkan

### A. WhatsApp Integration Module

Fungsi:

* Menerima pesan masuk dari WhatsApp.
* Mengirim balasan otomatis dari AI.
* Mendeteksi kapan chat harus dialihkan ke manusia.

Opsi teknologi:

* WhatsApp Business API resmi
* Wablas
* Qontak
* Mekari
* Twilio WhatsApp
* Fonnte
* WA Gateway internal

Data yang dikirim ke sistem:

```json
{
  "phone": "628xxxx",
  "name": "Nama jika tersedia",
  "message": "Isi chat user",
  "timestamp": "2026-07-05 15:00:00"
}
```

---

### B. AI Conversation Engine

Ini otaknya.

Fungsi:

* Memahami bahasa chat manusia.
* Bisa membaca typo, bahasa santai, bahasa Palembang/Indonesia campur.
* Tidak menjawab kaku seperti bot.
* Menjawab sesuai konteks gym.
* Tidak langsung hard selling.

Contoh gaya AI:

> Siap kak, boleh saya bantu. Kakak tujuannya mau mulai gym untuk turun berat badan, bentuk badan, sehat, atau cari kelas seperti Zumba/Yoga?

---

### C. Knowledge Base Module

Berisi semua informasi yang boleh dijawab AI.

Isi database:

* Promo aktif
* Harga umum
* Fasilitas gym
* Jam operasional
* Lokasi
* Parkir
* Kelas
* Personal Trainer
* Membership
* Free trial jika ada
* Syarat dan ketentuan promo
* Cara daftar
* FAQ

Contoh tabel:

| Kategori        | Isi                                         |
| --------------- | ------------------------------------------- |
| Promo           | Promo Juli 12 bulan Rp…                     |
| Fasilitas       | Full AC, alat lengkap, locker, sauna, kelas |
| Jam Operasional | 06.00–22.00                                 |
| Lokasi          | International Plaza Mall Palembang          |
| Parkir          | Mobil Rp5.000 flat, motor Rp3.000 flat      |

Catatan penting:
**AI tidak boleh mengarang promo. Semua jawaban harus dari database.**

---

### D. Lead Qualification Module

AI harus menggali data calon member.

Data minimal yang dikumpulkan:

* Nama
* Tujuan gym
* Domisili
* Pernah gym atau belum
* Minat: membership / PT / kelas
* Kapan rencana datang
* Budget jika natural ditanyakan
* Kendala/rasa takut
* Status keseriusan

Contoh pertanyaan:

> Kakak targetnya lebih ke turun berat badan, bentuk badan, sehat, atau mau ikut kelas?

> Rencananya mau mulai bulan ini atau masih lihat-lihat dulu kak?

---

### E. Lead Scoring Module

AI memberi nilai otomatis.

| Perilaku calon member   | Score |
| ----------------------- | ----: |
| Baru tanya harga        |    20 |
| Tanya fasilitas         |    30 |
| Tanya promo aktif       |    40 |
| Tanya lokasi/jam buka   |    50 |
| Tanya bisa datang kapan |    70 |
| Tanya cara daftar       |    80 |
| Tanya transfer/DP       |    90 |
| Bilang mau daftar       |   100 |

Kategori:

* **0–40:** Cold lead
* **41–69:** Warm lead
* **70–100:** Hot lead

Kalau sudah **70 ke atas**, AI mulai arahkan ke CS/Marketing.

---

### F. Human Handover Module

Kalau calon member serius, AI berhenti menjelaskan panjang dan oper ke manusia.

Trigger handover:

* “Saya mau daftar”
* “Bisa bayar sekarang?”
* “Besok saya datang”
* “Harga final berapa?”
* “Ada nomor marketing?”
* “Saya mau ambil promo”
* “Bisa DP dulu?”
* “Saya ke sana jam berapa?”

Template AI:

> Siap kak, berarti kakak sudah cukup cocok ya. Saya bantu hubungkan ke tim membership kami supaya kakak bisa dibantu cek promo aktif, harga terbaik hari ini, dan jadwal visit.

Lalu sistem kirim notifikasi ke CS:

```json
{
  "status": "HOT LEAD",
  "nama": "Calon Member",
  "nomor": "628xxxx",
  "tujuan": "Turun berat badan",
  "minat": "Membership 12 bulan",
  "kendala": "Masih tanya promo",
  "rencana_datang": "Besok sore",
  "lead_score": 85,
  "summary": "Calon member tertarik daftar, minta harga terbaik dan ingin datang besok sore."
}
```

---

## 4. Role AI

AI harus bersikap sebagai:

**AI Membership Assistant Loyal Fitness**

Karakter:

* Ramah
* Natural
* Tidak kaku
* Tidak terlalu panjang
* Tidak memaksa
* Bisa membaca kebutuhan emosional calon member
* Fokus bantu dulu, closing belakangan

AI tidak boleh:

* Mengarang harga
* Menjanjikan diskon tanpa data
* Menjelekkan kompetitor
* Menjawab kasar
* Memaksa bayar
* Mengambil keputusan final harga

---

## 5. Prompt Utama AI

Tim IT bisa pakai ini sebagai base prompt:

```text
Kamu adalah AI Membership Assistant untuk gym.

Tugas kamu:
1. Menjawab pertanyaan calon member secara ramah, natural, dan manusiawi.
2. Memahami kebutuhan calon member sebelum menawarkan promo.
3. Menggali tujuan calon member seperti turun berat badan, bentuk badan, sehat, ikut kelas, atau personal trainer.
4. Menjelaskan promo dan fasilitas hanya berdasarkan data knowledge base.
5. Jangan mengarang harga, promo, bonus, atau janji yang tidak ada di database.
6. Jangan langsung hard selling.
7. Jika calon member terlihat serius ingin daftar, ingin datang, tanya pembayaran, DP, transfer, atau harga final, alihkan ke CS/Marketing.
8. Sebelum handover, buat ringkasan lead untuk CS/Marketing.
9. Gunakan bahasa Indonesia santai, sopan, dan mudah dimengerti.
10. Jawaban jangan terlalu panjang kecuali user meminta detail.
```

---

## 6. Intent Detection

AI harus bisa deteksi maksud chat:

| Intent          | Contoh chat                |
| --------------- | -------------------------- |
| Tanya harga     | “berapa membership?”       |
| Tanya promo     | “ada promo ga?”            |
| Tanya lokasi    | “lokasinya dimana?”        |
| Tanya fasilitas | “ada sauna?”               |
| Tanya kelas     | “ada zumba/yoga?”          |
| Tanya PT        | “personal trainer berapa?” |
| Ragu-ragu       | “takut ga konsisten”       |
| Siap beli       | “saya mau daftar”          |
| Visit           | “besok bisa datang?”       |
| Komplain        | “kok mahal?”               |

---

## 7. Dashboard Admin

Tim perlu bikin dashboard sederhana untuk:

* Lihat semua chat masuk
* Status lead
* Lead score
* Nama calon member
* Nomor WhatsApp
* Minat
* Tujuan
* CS yang handle
* Status follow-up
* Closing / belum closing

Status:

* New Lead
* Cold
* Warm
* Hot
* Handover to CS
* Visit Scheduled
* Closed Won
* Closed Lost

---

## 8. Urutan Pengerjaan Tim IT

### Tahap 1 — MVP

Yang paling penting dulu:

1. Integrasi WhatsApp
2. AI reply basic
3. Knowledge base promo/fasilitas
4. Lead scoring
5. Handover ke CS

### Tahap 2 — CRM

Tambahkan:

1. Dashboard lead
2. Riwayat chat
3. Status follow-up
4. Assign ke CS/Marketing
5. Report closing

### Tahap 3 — Automation

Tambahkan:

1. Follow-up otomatis H+1
2. Reminder visit
3. Broadcast promo
4. Reminder renewal member
5. Analisa pertanyaan paling sering

---

## 9. Struktur Database Minimal

### Table: leads

```sql
id
name
phone
goal
interest
budget
location
status
lead_score
assigned_to
created_at
updated_at
```

### Table: conversations

```sql
id
lead_id
sender
message
created_at
```

### Table: promos

```sql
id
promo_name
description
price
bonus
valid_until
terms
is_active
```

### Table: handovers

```sql
id
lead_id
summary
reason
assigned_to
status
created_at
```

---

## 10. Output Akhir yang Harus Jadi

Tim IT harus menghasilkan:

1. WhatsApp AI aktif.
2. AI bisa jawab promo dan fasilitas.
3. AI bisa tanya kebutuhan calon member.
4. AI bisa menilai calon member serius atau tidak.
5. AI bisa oper ke CS/Marketing.
6. CS menerima ringkasan lead.
7. Semua chat tersimpan di CRM.
8. Owner bisa lihat data lead dan closing.

---

Menurut gue jangan langsung bikin terlalu kompleks. Fokus dulu ke **AI WhatsApp + knowledge promo + handover CS**. Itu yang paling cepat terasa hasilnya buat efisiensi tim.