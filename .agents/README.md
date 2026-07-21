# 🚀 WhatsAI-CRM v2.0 — System Documentation & Technical Blueprint

Welcome to the official developer documentation and technical review repository for **WhatsAI-CRM**, a production-grade, AI-powered WhatsApp Customer Relationship Management (CRM) platform tailored for **Loyal Fitness Prime PS**.

---

## 📌 Executive Overview

WhatsAI-CRM bridges WhatsApp messaging with AI auto-replies, lead score tracking, automated CS takeover (Auto-Mute), smart broadcast campaigns, and real-time live terminal monitoring.

- **Frontend**: React 18 + Inertia.js v1.0 + Vite + TailwindCSS (Custom Dark Mode Aesthetics)
- **Backend**: Laravel 11 (PHP 8.2+) + SQLite/MySQL
- **WhatsApp Engine**: Dual Gateway Architecture — Local Baileys Node.js Socket (`whatsapp-gateway/gateway.js` - Port 3000) & OpenWA REST Server (Port 2785)
- **AI Brain**: OpenAI GPT-4o + Multi-tier Fallback (Google Gemini & Rule-based NLP)

---

## 📁 Agent Sitemap & Documentation Index

All technical documentation modules are maintained inside the `.agents/` folder:

| File | Description |
|---|---|
| 📄 [`.agents/README.md`](file:///home/ridzz/Dokumen/WORKING/WhatsAI-CRM/.agents/README.md) | Executive summary, tech stack, and repository sitemap |
| 🏗️ [`.agents/SYSTEM_ARCHITECTURE.md`](file:///home/ridzz/Dokumen/WORKING/WhatsAI-CRM/.agents/SYSTEM_ARCHITECTURE.md) | Mermaid diagrams, technical data flows, DB schemas, and cache keys |
| 🤖 [`.agents/AI_REPLY_AND_AUTO_MUTE.md`](file:///home/ridzz/Dokumen/WORKING/WhatsAI-CRM/.agents/AI_REPLY_AND_AUTO_MUTE.md) | Knowledge Base, MC handover mapping, 4-layer CS Auto-Mute, and typing delay interceptor |
| 📱 [`.agents/UI_AND_RESPONSIVENESS.md`](file:///home/ridzz/Dokumen/WORKING/WhatsAI-CRM/.agents/UI_AND_RESPONSIVENESS.md) | Dark-mode design tokens, mobile drawers, 5-icon bottom nav, and mobile tab switchers |
| 🛠️ [`.agents/GATEWAY_SETUP_AND_TROUBLESHOOTING.md`](file:///home/ridzz/Dokumen/WORKING/WhatsAI-CRM/.agents/GATEWAY_SETUP_AND_TROUBLESHOOTING.md) | Gateway launch commands, instant QR & 8-digit pairing flows, and common error fixes |

---

## ⚡ Quick Start Guide

### 1. Start Laravel Backend
```bash
php artisan serve --port=8001
```

### 2. Start Vite Asset Compiler
```bash
npm run dev
```

### 3. Launch WhatsApp Gateway Engine
```bash
cd whatsapp-gateway
node gateway.js
```

---

## 🔒 License & Copyright
Developed for **Loyal Fitness Prime PS** — Confidential & Proprietary.
