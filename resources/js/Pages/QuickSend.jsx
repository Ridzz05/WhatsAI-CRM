import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    PaperPlaneTilt, 
    Sparkle, 
    Lightning, 
    Clock, 
    MagnifyingGlass,
    Trash,
    WhatsappLogo,
    UploadSimple,
    TextB,
    TextItalic,
    TextStrikethrough,
    Code,
    CheckCircle,
    CaretDown
} from '@phosphor-icons/react';

export default function QuickSend({ auth }) {
    // Form States
    const [selectedChannel, setSelectedChannel] = useState('openwa');
    const [recipients, setRecipients] = useState('');
    const [messageText, setMessageText] = useState('');
    const [activeAiTab, setActiveAiTab] = useState('gaya'); // 'gaya', 'buat', 'audit'
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // History Log State
    const [logs, setLogs] = useState([]);

    // Format Helpers
    const insertFormat = (symbol) => {
        if (symbol === 'b') setMessageText(prev => prev + ' *teks tebal*');
        else if (symbol === 'i') setMessageText(prev => prev + ' _teks miring_');
        else if (symbol === 's') setMessageText(prev => prev + ' ~teks dicoret~');
        else if (symbol === 'code') setMessageText(prev => prev + ' ```teks kode```');
    };

    const insertVariable = (varName) => {
        setMessageText(prev => prev + ` {{${varName}}}`);
    };

    // AI Style Application
    const applyAiStyle = (styleType) => {
        if (!messageText.trim()) return;
        setIsAiLoading(true);

        setTimeout(() => {
            if (styleType === 'marketing') {
                setMessageText(`🔥 PROMO SPESIAL HARI INI! 🔥\n\nHalo {{nama}},\n${messageText}\n\nKlaim diskon khusus Anda sekarang sebelum slot habis! 🚀`);
            } else if (styleType === 'formal') {
                setMessageText(`Kepada Yth. {{nama}},\n\n${messageText}\n\nDemikian informasi ini kami sampaikan. Terima kasih.`);
            } else if (styleType === 'santai') {
                setMessageText(`Halo {{nama}}! 😊\n\n${messageText}\n\nFeel free buat tanya-tanya ya kak! 🙏`);
            } else if (styleType === 'profesional') {
                setMessageText(`Yth. {{nama}},\n\nSehubungan dengan layanan kami, ${messageText}\n\nHormat kami,\nTim WhatsAI CRM.`);
            } else if (styleType === 'mendesak') {
                setMessageText(`🚨 PERHATIAN! Slot Terbatas untuk {{nama}}!\n\n${messageText}\n\nSegera konfirmasi dalam 24 jam!`);
            } else if (styleType === 'ramah') {
                setMessageText(`Selamat pagi/siang {{nama}}! Hope you have a great day! ✨\n\n${messageText}`);
            } else if (styleType === 'optimalkan') {
                setMessageText(`Halo {{nama}}, ${messageText} 🙏`);
            }
            setIsAiLoading(false);
        }, 600);
    };

    const handleSendQuick = (e) => {
        e.preventDefault();
        if (!recipients.trim() || !messageText.trim()) return;

        const recipientList = recipients.split(/[\n,]+/).map(r => r.trim()).filter(Boolean);

        const newLogs = recipientList.map((r, idx) => ({
            id: Date.now() + idx,
            recipient: r.includes('|') ? r.split('|')[0] : r,
            name: r.includes('|') ? r.split('|')[1] : 'Pelanggan',
            message: messageText.replace(/{{nama}}/g, r.includes('|') ? r.split('|')[1] : 'Kakak'),
            sentAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
            status: 'terkirim'
        }));

        setLogs([...newLogs, ...logs]);
        setRecipients('');
        setMessageText('');
        alert(`Pesan berhasil dikirim secara instan ke ${recipientList.length} nomor tujuan!`);
    };

    const handleDeleteLog = (id) => {
        setLogs(logs.filter(l => l.id !== id));
    };

    return (
        <AdminLayout activeTab="quicksend" title="Kirim Cepat (Quick Send) — WhatsAI">
            <Head title="Kirim Cepat (Quick Send) - WhatsAI CRM" />

            {/* Page Header */}
            <div className="pb-4 border-b border-[#ebe6dd]/10 mb-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    Kirim Cepat (Quick Send)
                </h1>
                <p className="text-xs text-[#f5efe4]/60 mt-1">
                    Kirim pesan ke beberapa kontak/tujuan sekaligus secara instan tanpa membuat campaign.
                </p>
            </div>

            {/* Main Grid (Left Form 7 Cols, Right History 5 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: Main Form & AI Assistant (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    
                    <form onSubmit={handleSendQuick} className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-5">
                        
                        {/* 1. PILIH AKUN / CHANNEL PENGIRIM */}
                        <div>
                            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#f5efe4]/70 mb-1.5">
                                PILIH AKUN / CHANNEL PENGIRIM
                            </label>
                            <select 
                                value={selectedChannel}
                                onChange={(e) => setSelectedChannel(e.target.value)}
                                className="w-full bg-[#1a1714] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e98425]"
                            >
                                <option value="openwa">🟢 OpenWA Gateway Server (Port 2785 - Connected)</option>
                                <option value="baileys">🟢 WhatsApp Web Direct (Baileys Engine - Active)</option>
                            </select>
                        </div>

                        {/* 2. NOMOR TUJUAN / KONTAK PENERIMA */}
                        <div>
                            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#f5efe4]/70 mb-1.5">
                                NOMOR TUJUAN / KONTAK PENERIMA
                            </label>
                            <textarea
                                required
                                rows={4}
                                placeholder="Masukkan nomor telepon (format: 628xxx) atau target ID lainnya.&#10;Gunakan koma atau baris baru untuk memisahkan banyak tujuan."
                                value={recipients}
                                onChange={(e) => setRecipients(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425] font-mono leading-relaxed"
                            />
                            <span className="text-[11px] text-[#f5efe4]/40 mt-1.5 block font-mono">
                                Gunakan format <code className="bg-white/10 px-1 py-0.5 rounded text-[#e98425]">nomor|nama</code> untuk variabel dinamis. Contoh: <code className="bg-white/10 px-1 py-0.5 rounded text-white">628123456789|Budi</code>
                            </span>
                        </div>

                        {/* 3. ISI PESAN & TOOLBAR */}
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#f5efe4]/70">
                                    ISI PESAN
                                </label>

                                {/* Variables Bar */}
                                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#f5efe4]/60 flex-wrap">
                                    <span>SISIPKAN:</span>
                                    {['nama', 'nomor', 'tanggal', 'waktu'].map((v) => (
                                        <button
                                            type="button"
                                            key={v}
                                            onClick={() => insertVariable(v)}
                                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10.5px] font-mono text-[#e98425] transition-all"
                                        >
                                            {'{' + '{' + v + '}' + '}'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Textarea Toolbar */}
                            <div className="bg-white/5 border border-white/10 border-b-0 rounded-t-xl p-2 flex items-center justify-between gap-2 flex-wrap">
                                {/* Text Formatting Buttons */}
                                <div className="flex items-center gap-1 border-r border-white/10 pr-2">
                                    <button 
                                        type="button" 
                                        onClick={() => insertFormat('b')} 
                                        className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                                        title="Bold (Tebal)"
                                    >
                                        <TextB className="w-4 h-4" />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => insertFormat('i')} 
                                        className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                                        title="Italic (Miring)"
                                    >
                                        <TextItalic className="w-4 h-4" />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => insertFormat('s')} 
                                        className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                                        title="Strikethrough (Coret)"
                                    >
                                        <TextStrikethrough className="w-4 h-4" />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => insertFormat('code')} 
                                        className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                                        title="Monospace Code"
                                    >
                                        <Code className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* AI Quick Style Badges */}
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10.5px] font-mono text-[#e98425] flex items-center gap-1">
                                        <Sparkle className="w-3 h-3" /> AI Quick:
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={() => applyAiStyle('optimalkan')}
                                        className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all"
                                    >
                                        ✨ Optimalkan
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => applyAiStyle('marketing')}
                                        className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 transition-all"
                                    >
                                        🔥 Marketing
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => applyAiStyle('santai')}
                                        className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
                                    >
                                        🥤 Santai
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => applyAiStyle('formal')}
                                        className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-all"
                                    >
                                        💼 Formal
                                    </button>
                                </div>
                            </div>

                            <textarea
                                required
                                rows={6}
                                placeholder="Ketik isi pesan Anda di sini...&#10;Gunakan {{nama}} untuk menyisipkan nama penerima secara dinamis."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-b-xl p-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425] leading-relaxed"
                            />
                        </div>

                        {/* 4. MEDIA / LAMPIRAN (GAMBAR ATAU DOKUMEN) */}
                        <div>
                            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#f5efe4]/70 mb-1.5">
                                MEDIA / LAMPIRAN (GAMBAR ATAU DOKUMEN)
                            </label>
                            <div className="w-full border-2 border-dashed border-white/15 rounded-xl p-4 text-center cursor-pointer hover:border-[#e98425]/50 transition-colors flex items-center justify-center gap-2 bg-white/5">
                                <UploadSimple className="w-4 h-4 text-[#e98425]" />
                                <span className="text-xs text-[#f5efe4]/60 font-medium">
                                    Pilih file Gambar atau Dokumen
                                </span>
                            </div>
                        </div>

                        {/* 5. ACTION BUTTON */}
                        <button
                            type="submit"
                            className="w-full py-3.5 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-extrabold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <PaperPlaneTilt className="w-4 h-4" weight="bold" />
                            Kirim Sekarang
                        </button>

                    </form>

                    {/* 6. ASISTEN PENULISAN AI (✦ AI Live Card) */}
                    <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                                <Sparkle className="w-4 h-4 text-[#e98425]" /> ASISTEN PENULISAN AI
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-[#e98425]/15 text-[#e98425] px-2 py-0.5 rounded border border-[#e98425]/30">
                                ✦ AI Live
                            </span>
                        </div>

                        {/* AI Sub-Tabs */}
                        <div className="flex items-center bg-[#0d0c0b] border border-white/10 rounded-xl p-1">
                            {['gaya', 'buat', 'audit'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setActiveAiTab(t)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                                        activeAiTab === t
                                            ? 'bg-white text-[#1a1714] shadow-md'
                                            : 'text-[#f5efe4]/50 hover:text-white'
                                    }`}
                                >
                                    {t === 'gaya' ? 'Gaya Bahasa' : t === 'buat' ? 'Buat Baru' : 'Audit'}
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-[#f5efe4]/60 leading-relaxed">
                            Tulis pesan Anda di form editor utama terlebih dahulu, lalu klik tombol gaya di bawah untuk memolesnya secara otomatis menggunakan AI.
                        </p>

                        {/* AI 6 Style Buttons Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => applyAiStyle('marketing')}
                                disabled={isAiLoading}
                                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                🔥 Marketing
                            </button>
                            <button
                                type="button"
                                onClick={() => applyAiStyle('formal')}
                                disabled={isAiLoading}
                                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                💼 Formal
                            </button>
                            <button
                                type="button"
                                onClick={() => applyAiStyle('santai')}
                                disabled={isAiLoading}
                                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                🥤 Santai
                            </button>
                            <button
                                type="button"
                                onClick={() => applyAiStyle('profesional')}
                                disabled={isAiLoading}
                                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                📈 Profesional
                            </button>
                            <button
                                type="button"
                                onClick={() => applyAiStyle('mendesak')}
                                disabled={isAiLoading}
                                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                🚨 Mendesak
                            </button>
                            <button
                                type="button"
                                onClick={() => applyAiStyle('ramah')}
                                disabled={isAiLoading}
                                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium flex items-center justify-center gap-2 transition-all"
                            >
                                🤗 Ramah
                            </button>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: RIWAYAT PENGIRIMAN (5 Cols) */}
                <div className="lg:col-span-5 bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 min-h-[480px] flex flex-col justify-start">
                    
                    <h2 className="text-xs font-extrabold text-[#f5efe4]/80 uppercase tracking-wider mb-4 border-b border-[#ebe6dd]/10 pb-3">
                        RIWAYAT PENGIRIMAN
                    </h2>

                    {logs.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {logs.map((log) => (
                                <div 
                                    key={log.id}
                                    className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex flex-col gap-2 hover:border-white/15 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono font-bold text-[#e98425] flex items-center gap-1">
                                            <WhatsappLogo className="w-3.5 h-3.5 text-emerald-400" weight="fill" />
                                            {log.recipient} ({log.name})
                                        </span>
                                        <span className="text-[10px] font-mono text-[#f5efe4]/40">
                                            {log.sentAt}
                                        </span>
                                    </div>

                                    <p className="text-xs text-white/80 leading-relaxed bg-[#0d0c0b] p-2.5 rounded-lg border border-white/5">
                                        "{log.message}"
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                                            <CheckCircle className="w-3 h-3" /> Terkirim
                                        </span>
                                        <button 
                                            onClick={() => handleDeleteLog(log.id)}
                                            className="text-red-400 hover:text-red-300 p-1"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State matching Screenshot AUTOIN */
                        <div className="flex flex-col items-center justify-center my-auto py-24 text-center">
                            <PaperPlaneTilt className="w-10 h-10 text-[#f5efe4]/20 mb-3" weight="light" />
                            <span className="text-xs text-[#f5efe4]/40 font-sans">
                                Belum ada aktivitas pengiriman.
                            </span>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
