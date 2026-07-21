# 🛠️ Gateway Setup, Pairing Flows & Troubleshooting Guide

This operational guide provides step-by-step instructions for running the WhatsApp Gateway, handling session pairing, and troubleshooting technical issues.

---

## ⚡ Gateway Architecture & Launch Instructions

The system supports two gateway engines:
1. **Baileys Gateway Engine (Default / Recommended)**: Light-weight Node.js process running `whatsapp-gateway/gateway.js` on **Port 3000**.
2. **OpenWA REST Server**: External REST API service running on **Port 2785**.

### How to Start the Baileys Gateway:
```bash
cd /home/ridzz/Dokumen/WORKING/WhatsAI-CRM/whatsapp-gateway
node gateway.js
```

---

## 📲 Pairing Flows

### 1. QR Code Pairing Flow (Frontend-rendered PNG Image)
1. Open the CRM Dashboard or navigate to `/dashboard/device`.
2. Click **Pair Device Baru**.
3. Laravel triggers `GET http://localhost:3000/pair` on-demand to initialize a fresh socket in `gateway.js`.
4. `gateway.js` generates the raw Baileys QR string and broadcasts it to Laravel via `POST /api/whatsapp/status`.
5. `OpenWaService::formatQrImageUrl()` converts the raw string into a crisp PNG image URL via `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...`.
6. The frontend renders the QR PNG image inside the modal.
7. Scan the QR code using WhatsApp on your phone (**Linked Devices / Perangkat Tertaut**).

### 2. 8-Digit Phone Pairing Code Flow
1. In the Pair Device modal, switch to the **Kode Pairing HP** tab.
2. Enter your phone number (e.g., `08123456789`).
3. Click **Dapatkan Kode Pairing**.
4. Enter the 8-digit code into your WhatsApp mobile app under **Link with phone number instead**.

---

## 🔧 Common Error Resolutions & Troubleshooting

### Issue 1: `cURL error 7: Failed to connect to localhost:2785`
- **Cause**: OpenWA REST server on port 2785 is not running.
- **Resolution**: This error trace is now automatically suppressed when port 2785 is offline. The system seamlessly uses the local Baileys Gateway on port 3000.

### Issue 2: Infinite Loading Spinner ("Memuat Kode QR...")
- **Cause 1**: The 90-second cache TTL expired before the QR was scanned.
  - *Fix (`d4e93e8`)*: `gateway.js` now sends a periodic 10-second heartbeat so the cache never expires while waiting for scan.
- **Cause 2**: Raw Baileys QR link string starting with `https://wa.me/...` failed in HTML `<img>` tag `src`.
  - *Fix (`b22b01e`)*: Backend now converts raw strings to PNG image URLs via `formatQrImageUrl()`.

### Issue 3: Duplicate Message Delivery (Pesan Terkirim Ganda)
- **Cause**: `handleWebhook()` called `OpenWaService::sendMessage()` while `gateway.js` ALSO sent the reply from the webhook JSON body.
- **Fix (`54dafb3`)**: Removed `sendMessage()` inside `handleWebhook()` so `gateway.js` is the sole execution pipeline for incoming AI replies.

### Issue 4: AI Replies Before CS Finishes Reading / Typing
- **Cause**: `message-receipt.update` (Centang Biru) was not bound to Auto-Mute trigger.
- **Fix (`e0b3d5c`)**: Added `message-receipt.update` listener in `gateway.js` so opening/reading a chat room on the phone instantly triggers `handleManualActivity` and aborts pending AI replies.
