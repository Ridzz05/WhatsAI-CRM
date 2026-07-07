const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const axios = require('axios');
const http = require('http');

const fs = require('fs');
const path = require('path');

// Dynamically read APP_URL from parent .env file to support both local and production environments
let LARAVEL_BASE_URL = 'http://localhost:8000';
try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/^APP_URL=(.*)$/m);
        if (match && match[1]) {
            LARAVEL_BASE_URL = match[1].trim().replace(/\/+$/, '');
        }
    }
} catch (e) {
    console.error('⚠️ Gagal membaca berkas .env parent:', e.message);
}

const LARAVEL_WEBHOOK_URL = `${LARAVEL_BASE_URL}/api/whatsapp/webhook`;
const LARAVEL_STATUS_URL = `${LARAVEL_BASE_URL}/api/whatsapp/status`;

// Track connection state globally
let isConnected = false;
let heartbeatInterval = null;
let sock = null;

async function startBot() {
    // Save authentication state credentials inside folder "auth_session"
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');

    console.log('Menginisialisasi WhatsApp Socket...');
    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }) // Let Baileys handle version and browser by default for maximum stability
    });

    // Helper to send connection status reports back to Laravel
    const sendStatusReport = async (status, qr = null) => {
        try {
            await axios.post(LARAVEL_STATUS_URL, { status, qr });
        } catch (err) {
            // Silently ignore connection errors to Laravel on startup
        }
    };

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n======================================================');
            console.log('   SILAKAN SCAN QR CODE BERIKUT DENGAN WHATSAPP ANDA');
            console.log('======================================================\n');
            qrcode.generate(qr, { small: true });
            await sendStatusReport('disconnected', qr);
        }
        
        if (connection === 'close') {
            isConnected = false;
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
                heartbeatInterval = null;
            }

            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            console.log(`Koneksi tertutup (Status: ${statusCode}). Reconnecting: ${shouldReconnect}`);
            
            // Notify Laravel gateway is disconnected
            await sendStatusReport('disconnected');

            if (lastDisconnect?.error) {
                console.log('Detail Error:', lastDisconnect.error.message || lastDisconnect.error);
            }
            
            if (shouldReconnect) {
                console.log('Menunggu 5 detik sebelum menghubungkan ulang...');
                setTimeout(() => {
                    startBot();
                }, 5000);
            }
        } else if (connection === 'open') {
            isConnected = true;
            console.log('\n✅ GATEWAY WHATSAPP BAILEYS BERHASIL TERHUBUNG!');
            console.log('Gateway siap meneruskan chat masuk ke Laravel CRM.\n');
            
            // Notify Laravel gateway is connected
            await sendStatusReport('connected');

            // Setup periodic 45s heartbeat to keep connection status active in Laravel cache (90s limit)
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            heartbeatInterval = setInterval(async () => {
                if (isConnected) {
                    await sendStatusReport('connected');
                }
            }, 45000);
        }
    });

    // Save session credentials
    sock.ev.on('creds.update', saveCreds);

    // Monitor message delivery status (Acks)
    sock.ev.on('messages.update', (updates) => {
        for (const update of updates) {
            if (update.update?.status) {
                const statusMap = {
                    0: 'PENDING (Sedang dikirim)',
                    1: 'SERVER_ACK (Diterima server WhatsApp - Centang 1)',
                    2: 'DELIVERED (Sampai di HP Penerima - Centang 2)',
                    3: 'READ (Dibaca oleh Penerima - Centang Biru)',
                    4: 'PLAYED (Audio diputar)'
                };
                const statusName = statusMap[update.update.status] || `UNKNOWN (${update.update.status})`;
                console.log(`[STATUS DELIVERY] MsgID: ${update.key.id} -> ${statusName}`);
            }
        }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        
        // Only process incoming text messages from other users
        if (!msg.key.fromMe && m.type === 'notify') {
            // Resolve JID: Check for alternative phone number JID first (remoteJidAlt) to avoid @lid issues
            let phoneJid = msg.key.remoteJidAlt || msg.key.remoteJid;
            
            // Try resolving via signalRepository lidMapping if it is still a LID
            if (phoneJid.endsWith('@lid') && sock.signalRepository?.lidMapping) {
                try {
                    const resolved = await sock.signalRepository.lidMapping.getPNForLID(phoneJid);
                    if (resolved) {
                        console.log(`[LID RESOLVED] Mengubah LID ${phoneJid} -> Phone JID ${resolved}`);
                        phoneJid = resolved;
                    }
                } catch (err) {
                    // Ignore resolution errors
                }
            }

            const phone = phoneJid.replace('@s.whatsapp.net', '').replace('@lid', '');
            
            // Extract text message content
            const text = msg.message?.conversation || 
                         msg.message?.extendedTextMessage?.text || 
                         msg.message?.buttonsResponseMessage?.selectedButtonId;

            if (text) {
                console.log(`[WA MASUK] Dari: ${phone} (${phoneJid}) - Pesan: "${text}"`);

                try {
                    // 1. Post message to Laravel backend
                    const response = await axios.post(LARAVEL_WEBHOOK_URL, {
                        sender: phone,
                        message: text
                    });

                    // 2. Read AI reply back from Laravel response body
                    const aiResponse = response.data?.ai_response;

                    if (aiResponse) {
                        // Anti-Spam Typing Delay Simulation
                        const delayMs = Math.min(Math.max(aiResponse.length * 15, 2500), 6000);
                        
                        // Check if JID is standard s.whatsapp.net to trigger composing status safely.
                        const supportsPresence = phoneJid.endsWith('@s.whatsapp.net');

                        if (supportsPresence) {
                            console.log(`[TYPING] Mensimulasikan mengetik selama ${(delayMs / 1000).toFixed(1)} detik ke ${phoneJid}...`);
                            await sock.sendPresenceUpdate('composing', phoneJid);
                            await new Promise(resolve => setTimeout(resolve, delayMs));
                            await sock.sendPresenceUpdate('paused', phoneJid);
                        } else {
                            console.log(`[DELAY] Menunggu jeda anti-spam selama ${(delayMs / 1000).toFixed(1)} detik ke ${phoneJid} (Presence update dilewati)...`);
                            await new Promise(resolve => setTimeout(resolve, delayMs));
                        }

                        console.log(`[AI BALAS] Untuk: ${phone} (${phoneJid}) - Jawaban: "${aiResponse.substring(0, 60)}..."`);
                        
                        // 3. Send AI response back using Baileys socket!
                        const sentMsg = await sock.sendMessage(phoneJid, { text: aiResponse });
                        console.log(`[SUCCESS] Balasan terkirim ke WhatsApp. MsgID: ${sentMsg?.key?.id}`);
                    }
                } catch (error) {
                    console.error('❌ Gagal memproses pesan via Laravel Webhook:', error.message);
                }
            }
        }
    });
}

// Start local HTTP server using built-in http module (no dependencies needed) to receive outgoing message requests from Laravel
const server = http.createServer((req, res) => {
    // Expose API send message endpoint
    if (req.method === 'POST' && req.url === '/api/send') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body);
                const { phone, message } = payload;

                if (!phone || !message) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Missing phone or message parameter' }));
                }

                if (!sock || !isConnected) {
                    res.writeHead(503, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'WhatsApp socket is not connected' }));
                }

                // Resolve target JID format
                const jid = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`;

                console.log(`[ASYNCHRONOUS SEND] Mengirim pesan ke ${jid} (Isi: "${message.substring(0, 60)}...")`);
                
                const sentMsg = await sock.sendMessage(jid, { text: message });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ success: true, msgId: sentMsg?.key?.id }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: err.message }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

// Listen on port 3000 for outgoing message REST requests
server.listen(3000, () => {
    console.log('Gateway HTTP server running on port 3000 (REST API active)');
});

startBot();
