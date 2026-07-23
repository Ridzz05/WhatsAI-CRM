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

// Dynamically read APP_URL and WHATSAPP_WEBHOOK_SECRET from parent .env file
let LARAVEL_BASE_URL = 'http://localhost:8001';
let WEBHOOK_SECRET = 'whatsai_secret_key_crm_2026';
try {
    const envPath = path.join(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const matchUrl = envContent.match(/^APP_URL=(.*)$/m);
        if (matchUrl && matchUrl[1]) {
            LARAVEL_BASE_URL = matchUrl[1].trim().replace(/\/+$/, '');
        }
        const matchSecret = envContent.match(/^WHATSAPP_WEBHOOK_SECRET=(.*)$/m);
        if (matchSecret && matchSecret[1]) {
            WEBHOOK_SECRET = matchSecret[1].trim();
        }
    }
} catch (e) {
    console.error('⚠️ Gagal membaca berkas .env parent:', e.message);
}

if (WEBHOOK_SECRET) {
    axios.defaults.headers.common['X-Gateway-Secret'] = WEBHOOK_SECRET;
}

const LARAVEL_WEBHOOK_URL = `${LARAVEL_BASE_URL}/api/whatsapp/webhook`;
const LARAVEL_STATUS_URL = `${LARAVEL_BASE_URL}/api/whatsapp/status`;

// Track connection state globally
let isConnected = false;
let latestQr = null;
let heartbeatInterval = null;
let sock = null;
const botSentMessageIds = new Set();

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
            latestQr = qr;
            console.log('\n📲 [WHATSAPP GATEWAY] Kode QR WhatsApp baru telah berhasil dibuat!');
            console.log('👉 Silakan buka Dashboard CRM di browser untuk memindai QR Code di layar.\n');
            await sendStatusReport('disconnected', qr);

            // Periodically refresh QR to Laravel every 10s so 90s cache never expires while waiting for scan
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            heartbeatInterval = setInterval(async () => {
                if (!isConnected && latestQr) {
                    await sendStatusReport('disconnected', latestQr);
                }
            }, 10000);
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
            await sendStatusReport('disconnected', latestQr);

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
            latestQr = null; // Clear QR code once connected
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

    // Monitor chat room activity (e.g. chat opened/read on paired phone)
    sock.ev.on('chats.update', (chats) => {
        for (const chat of chats) {
            if (chat.id && (chat.unreadCount === 0 || chat.read === true)) {
                let phoneJid = chat.id;
                if (phoneJid.endsWith('@s.whatsapp.net') || phoneJid.endsWith('@lid')) {
                    const phone = phoneJid.replace('@s.whatsapp.net', '').replace('@lid', '');
                    console.log(`[CHAT ROOM OPENED ON PHONE] Room chat ${phone} dibuka di HP. Mematikan AI...`);
                    const LARAVEL_MANUAL_ACTIVITY_URL = `${LARAVEL_BASE_URL}/api/whatsapp/manual-activity`;
                    axios.post(LARAVEL_MANUAL_ACTIVITY_URL, { phone }).catch(() => {});
                }
            }
        }
    });

    // Monitor read receipts when CS opens a room chat on paired phone (Centang Biru / Read)
    sock.ev.on('message-receipt.update', (receipts) => {
        for (const receipt of receipts) {
            if (receipt.key?.remoteJid) {
                let phoneJid = receipt.key.remoteJid;
                if (phoneJid.endsWith('@s.whatsapp.net') || phoneJid.endsWith('@lid')) {
                    const phone = phoneJid.replace('@s.whatsapp.net', '').replace('@lid', '');
                    console.log(`[READ RECEIPT DETECTED] Room chat ${phone} dibaca dari HP. Mematikan AI...`);
                    const LARAVEL_MANUAL_ACTIVITY_URL = `${LARAVEL_BASE_URL}/api/whatsapp/manual-activity`;
                    axios.post(LARAVEL_MANUAL_ACTIVITY_URL, { phone }).catch(() => {});
                }
            }
        }
    });

    // Monitor user presence updates (e.g. self presence, composing on paired phone)
    sock.ev.on('presence.update', async (update) => {
        if (!sock?.user?.id || !update.presences) return;
        const myPhoneNumber = sock.user.id.split(':')[0];
        
        // Check if any presence in the update belongs to our own paired account
        for (const [participantJid, presenceInfo] of Object.entries(update.presences)) {
            if (participantJid.includes(myPhoneNumber)) {
                const status = presenceInfo?.lastKnownPresence;
                if (status === 'composing' || status === 'recording' || status === 'available') {
                    let phoneJid = update.id;
                    if (phoneJid && (phoneJid.endsWith('@s.whatsapp.net') || phoneJid.endsWith('@lid'))) {
                        const phone = phoneJid.replace('@s.whatsapp.net', '').replace('@lid', '');
                        console.log(`[PRESENCE ACTIVE ON PHONE] HP Utama terdeteksi ${status} di room chat ${phone}. Mematikan AI...`);
                        const LARAVEL_MANUAL_ACTIVITY_URL = `${LARAVEL_BASE_URL}/api/whatsapp/manual-activity`;
                        axios.post(LARAVEL_MANUAL_ACTIVITY_URL, { phone }).catch(() => {});
                    }
                }
            }
        }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];

        // If the message is sent from the paired phone itself (human operator active)
        if (msg.key.fromMe && m.type === 'notify') {
            // Check if this message was sent by the bot (automated response)
            if (msg.key.id && botSentMessageIds.has(msg.key.id)) {
                // Ignore bot's own automated messages
                return;
            }

            let phoneJid = msg.key.remoteJidAlt || msg.key.remoteJid;
            if (phoneJid && (phoneJid.endsWith('@s.whatsapp.net') || phoneJid.endsWith('@lid'))) {
                const phone = phoneJid.replace('@s.whatsapp.net', '').replace('@lid', '');
                const text = msg.message?.conversation || 
                             msg.message?.extendedTextMessage?.text;

                if (text) {
                    console.log(`[MANUAL CHAT DETECTED] Agen mengirim pesan manual ke ${phone}. Menghubungi Laravel untuk mematikan AI...`);
                    const LARAVEL_MANUAL_ACTIVITY_URL = `${LARAVEL_BASE_URL}/api/whatsapp/manual-activity`;
                    axios.post(LARAVEL_MANUAL_ACTIVITY_URL, { phone })
                        .catch(err => {
                            console.error('❌ Gagal mengirim notifikasi manual-activity ke Laravel:', err.message);
                        });
                }
            }
        }
        
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
                         msg.message?.buttonsResponseMessage?.selectedButtonId ||
                         msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                         msg.message?.templateButtonReplyMessage?.selectedId;

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

                        // Re-check if the contact became muted by human activity while waiting out the typing delay
                        try {
                            const muteCheck = await axios.post(`${LARAVEL_BASE_URL}/api/whatsapp/check-mute`, { phone });
                            if (muteCheck.data?.is_muted) {
                                console.log(`[ABORT AI REPLY] Agen terdeteksi aktif di room chat ${phone}. Membatalkan balasan AI.`);
                                return;
                            }
                        } catch (err) {
                            // Silently ignore check errors
                        }

                        console.log(`[AI BALAS] Untuk: ${phone} (${phoneJid}) - Jawaban: "${aiResponse.substring(0, 60)}..."`);
                        
                        // 3. Send AI response back using Baileys socket!
                        let sendOptions = { text: aiResponse };
                        if (response.data?.list) {
                            sendOptions = {
                                text: aiResponse,
                                footer: response.data.list.footer || "Loyal Fitness CRM",
                                title: response.data.list.title,
                                buttonText: response.data.list.buttonText || "Klik di sini",
                                sections: response.data.list.sections
                            };
                        } else if (response.data?.buttons) {
                            sendOptions = {
                                text: aiResponse,
                                footer: response.data.buttons.footer || "Loyal Fitness CRM",
                                buttons: response.data.buttons.buttons,
                                headerType: response.data.buttons.headerType || 1
                            };
                        }

                        const sentMsg = await sock.sendMessage(phoneJid, sendOptions);
                        if (sentMsg?.key?.id) {
                            botSentMessageIds.add(sentMsg.key.id);
                            setTimeout(() => botSentMessageIds.delete(sentMsg.key.id), 60000);
                        }
                        console.log(`[SUCCESS] Balasan terkirim ke WhatsApp. MsgID: ${sentMsg?.key?.id}`);
                    }
                } catch (error) {
                    console.error('❌ Gagal memproses pesan via Laravel Webhook:', error.message);
                }
            }
        }
    });
}

const server = http.createServer((req, res) => {
    // Expose GET QR & status endpoint for direct query by Laravel
    if (req.method === 'GET' && (req.url === '/qr' || req.url === '/api/qr')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            success: true,
            authenticated: isConnected,
            qr: latestQr,
            status: isConnected ? 'connected' : 'disconnected'
        }));
    }

    if (req.method === 'GET' && (req.url === '/status' || req.url === '/api/status')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            status: isConnected ? 'connected' : 'disconnected',
            connected: isConnected,
            phone: sock?.user?.id ? sock.user.id.split(':')[0] : null,
            pushName: 'Loyal Fitness AI Assistant'
        }));
    }

    if (req.url === '/pair' || req.url === '/api/pair') {
        console.log('\n📲 [PAIR REQUEST] Permintaan pair baru diterima. Memulai ulang socket...');
        latestQr = null;
        isConnected = false;
        startBot();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, message: 'Re-initializing WhatsApp socket...' }));
    }

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
                
                let sendOptions = { text: message };
                if (payload.list) {
                    sendOptions = {
                        text: message,
                        footer: payload.list.footer || "Loyal Fitness CRM",
                        title: payload.list.title,
                        buttonText: payload.list.buttonText || "Klik di sini",
                        sections: payload.list.sections
                    };
                } else if (payload.buttons) {
                    sendOptions = {
                        text: message,
                        footer: payload.buttons.footer || "Loyal Fitness CRM",
                        buttons: payload.buttons.buttons,
                        headerType: payload.buttons.headerType || 1
                    };
                }

                const sentMsg = await sock.sendMessage(jid, sendOptions);
                if (sentMsg?.key?.id) {
                    botSentMessageIds.add(sentMsg.key.id);
                    setTimeout(() => botSentMessageIds.delete(sentMsg.key.id), 60000);
                }

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
