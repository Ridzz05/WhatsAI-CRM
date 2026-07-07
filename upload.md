# 📦 Upload & Deploy Whats-CS ke VPS

> **VPS:** Ubuntu 22.04 — `202.10.38.50`
> **Domain:** `crm.loyalfitness.id`
> **User VPS:** `loyalfitness`

---

## PART 1 — Setup VPS (SSH sebagai root)

```bash
ssh root@202.10.38.50
```

```bash
# 1. Update & install dependencies
apt update && apt install -y php8.1-sqlite3 curl unzip

# 2. Install Node.js 20 + PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs && npm install -g pm2

# 3. Buat direktori project
mkdir -p /home/loyalfitness/crm.loyalfitness.id

# 4. Set ownership
chown -R loyalfitness:loyalfitness /home/loyalfitness/crm.loyalfitness.id
```

---

## PART 2 — Upload dari Laptop Lokal (Git Bash)

```bash
# 1. Masuk ke parent folder
cd ~/Documents/WORKING/WORKING/GMY-MANAGEMENT

# 2. Compress project (exclude folder besar)
tar --exclude='node_modules' --exclude='vendor' --exclude='.git' --exclude='auth_session' -czf /tmp/whats-cs.tar.gz Whats-CS/

# 3. Upload ke VPS
scp /tmp/whats-cs.tar.gz root@202.10.38.50:/tmp/
```

---

## PART 3 — Extract di VPS (SSH sebagai root)

```bash
# 1. Extract ke direktori project
cd /home/loyalfitness/crm.loyalfitness.id
tar -xzf /tmp/whats-cs.tar.gz --strip-components=1

# 2. Set ownership
chown -R loyalfitness:loyalfitness /home/loyalfitness/crm.loyalfitness.id

# 3. Cleanup
rm /tmp/whats-cs.tar.gz
```

---

## PART 4 — Install Dependencies di VPS (SSH sebagai loyalfitness)

```bash
su - loyalfitness
cd ~/crm.loyalfitness.id

# 1. Install PHP dependencies
composer install --no-dev --optimize-autoloader

# 2. Setup environment
cp .env.example .env
nano .env
# -> Set APP_ENV=production, APP_DEBUG=false
# -> Set APP_URL=https://crm.loyalfitness.id
# -> Set OPENAI_API_KEY dan GEMINI_API_KEY

# 3. Generate app key
php artisan key:generate

# 4. Buat database SQLite
touch database/database.sqlite

# 5. Migrasi & seed
php artisan migrate --seed --force

# 6. Build frontend
npm install && npm run build

# 7. Install gateway dependencies
cd whatsapp-gateway && npm install && cd ..
```

---

## PART 5 — Setup Nginx (SSH sebagai root)

```bash
sudo nano /etc/nginx/sites-available/crm.loyalfitness.id
```

Paste:

```nginx
server {
    listen 80;
    server_name crm.loyalfitness.id;
    root /home/loyalfitness/crm.loyalfitness.id/public;

    index index.php index.html;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/crm.loyalfitness.id /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL Certificate
certbot --nginx -d crm.loyalfitness.id
```

---

## PART 6 — Permissions (SSH sebagai root)

```bash
chown -R loyalfitness:loyalfitness /home/loyalfitness/crm.loyalfitness.id
chmod -R 775 /home/loyalfitness/crm.loyalfitness.id/storage
chmod -R 775 /home/loyalfitness/crm.loyalfitness.id/bootstrap/cache
chmod 664 /home/loyalfitness/crm.loyalfitness.id/database/database.sqlite
chown www-data:loyalfitness /home/loyalfitness/crm.loyalfitness.id/database/database.sqlite
chown -R www-data:loyalfitness /home/loyalfitness/crm.loyalfitness.id/storage
```

---

## PART 7 — Start WhatsApp Gateway (SSH sebagai loyalfitness)

```bash
cd ~/crm.loyalfitness.id/whatsapp-gateway

# Update URL ke production (bukan localhost:8000)
sed -i "s|http://localhost:8000|http://127.0.0.1|g" gateway.js

# Start dengan PM2
pm2 start gateway.js --name "wa-gateway"
pm2 startup systemd
pm2 save

# Lihat QR Code untuk scan
pm2 logs wa-gateway
```

---

## PART 8 — Verifikasi

| # | Cek | Cara |
|---|-----|------|
| 1 | Website | Buka `https://crm.loyalfitness.id` |
| 2 | Login | `https://crm.loyalfitness.id/login` |
| 3 | Gateway | `pm2 status` |
| 4 | QR Scan | `pm2 logs wa-gateway` |
| 5 | Test bot | Kirim chat ke nomor WA |

---

## ⚠️ JANGAN LUPA: Ganti Password Root!

```bash
passwd
```
