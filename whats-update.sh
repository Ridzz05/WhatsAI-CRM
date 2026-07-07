#!/bin/bash

# ==============================================================================
# Whats-AI CRM — Auto Update & Deployment Script
# ==============================================================================
# Perintah ini akan menarik update terbaru dari GitHub, membersihkan cache,
# menjalankan migrasi, dan mengompilasi ulang aset Vite secara otomatis.
# ==============================================================================

echo "======================================================="
echo "      🚀 MEMULAI PROSES UPDATE WHATS-AI CRM"
echo "======================================================="

# Masuk ke direktori project
cd /home/loyalfitness/crm.loyalfitness.id || { echo "❌ Direktori project tidak ditemukan!"; exit 1; }

# 1. Tarik kode terbaru dari GitHub
echo "📥 Menarik perubahan kode terbaru dari GitHub..."
git fetch origin main
git reset --hard origin/main

# 2. Atur kembali kepemilikan dan permission file (PENTING untuk cPanel Apache)
echo "🔒 Mengatur ulang permission file & direktori..."
chown -R loyalfitness:loyalfitness /home/loyalfitness/crm.loyalfitness.id
chmod -R 755 /home/loyalfitness/crm.loyalfitness.id
chmod -R 775 /home/loyalfitness/crm.loyalfitness.id/storage
chmod -R 775 /home/loyalfitness/crm.loyalfitness.id/bootstrap/cache
if [ -f database/database.sqlite ]; then
    chmod 664 database/database.sqlite
fi

# 3. Bersihkan cache Laravel lama
echo "🧹 Membersihkan cache, config, dan route Laravel lama..."
su - loyalfitness -c "/opt/cpanel/ea-php84/root/usr/bin/php /home/loyalfitness/crm.loyalfitness.id/artisan config:clear"
su - loyalfitness -c "/opt/cpanel/ea-php84/root/usr/bin/php /home/loyalfitness/crm.loyalfitness.id/artisan route:clear"
su - loyalfitness -c "/opt/cpanel/ea-php84/root/usr/bin/php /home/loyalfitness/crm.loyalfitness.id/artisan view:clear"
su - loyalfitness -c "/opt/cpanel/ea-php84/root/usr/bin/php /home/loyalfitness/crm.loyalfitness.id/artisan cache:clear"

# 4. Jalankan database migrations (jika ada schema baru)
echo "🗄️ Menjalankan migrasi database..."
su - loyalfitness -c "/opt/cpanel/ea-php84/root/usr/bin/php /home/loyalfitness/crm.loyalfitness.id/artisan migrate --force"

# 5. Kompilasi asset frontend (Vite)
echo "📦 Mengompilasi ulang asset Vite frontend..."
su - loyalfitness -c "cd /home/loyalfitness/crm.loyalfitness.id && npm run build"

# 6. Restart PM2 Daemon (WhatsApp Gateway)
echo "🔄 Me-restart WhatsApp Gateway di PM2..."
pm2 restart wa-gateway

echo "======================================================="
echo "      ✅ UPDATE BERHASIL! APLIKASI 100% ONLINE"
echo "======================================================="
