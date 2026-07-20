import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    PaperPlaneTilt, 
    Sparkle, 
    Lightning, 
    Clock, 
    Users, 
    CheckCircle, 
    XCircle, 
    MagnifyingGlass,
    Trash,
    WhatsappLogo,
    ArrowClockwise
} from '@phosphor-icons/react';

export default function QuickSend({ auth }) {
    // Form State
    const [recipients, setRecipients] = useState('');
    const [messageText, setMessageText] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Quick Send History state
    const [logs, setLogs] = useState([
        {
            id: 1,
            recipient: "6281222827630",
            message: "Halo kak, info presales gym Loyal Fitness Prime Palembang Square sudah dibuka ya!",
            sentAt: "Hari ini, 22:45 WIB",
            status: "terkirim"
        },
        {
            id: 2,
            recipient: "62895604631765",
            message: "Undangan Visit Gym Free Trial Loyal Fitness.",
            sentAt: "Kemarin, 14:20 WIB",
            status: "terkirim"
        }
    ]);

    const handleSendQuick = (e) => {
        e.preventDefault();
        if (!recipients.trim() || !messageText.trim()) return;

        const recipientList = recipients.split(/[\n,]+/).map(r => r.trim()).filter(Boolean);

        const newLogs = recipientList.map((r, idx) => ({
            id: Date.now() + idx,
            recipient: r,
            message: messageText,
            sentAt: 'Baru saja',
            status: 'terkirim'
        }));

        setLogs([...newLogs, ...logs]);
        setRecipients('');
        setMessageText('');
        alert(`Pesan berhasil dikirim secara instan ke ${recipientList.length} nomor tujuan!`);
    };

    const applyAiStyle = (styleType) => {
        if (!messageText.trim()) return;
        setIsAiLoading(true);

        setTimeout(() => {
            if (styleType === 'ramah') {
                setMessageText(`Halo kak! 😊 ${messageText}\n\nAda yang bisa kami bantu lagi kak? 🙏`);
            } else if (styleType === 'persuasif') {
                setMessageText(`🔥 PROMO KUSUS HARI INI! 🔥\n\n${messageText}\n\nHubungi kami sekarang untuk klaim promo! 🚀`);
            } else if (styleType === 'singkat') {
                setMessageText(messageText.substring(0, 100) + '...');
            }
            setIsAiLoading(false);
        }, 700);
    };

    const handleDeleteLog = (id) => {
        if (confirm('Hapus riwayat pengiriman ini?')) {
            setLogs(logs.filter(l => l.id !== id));
        }
    };

    const filteredLogs = logs.filter(l => 
        l.recipient.includes(searchQuery) || l.message.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout activeTab="quicksend" title="Kirim Cepat (Quick Send) — WhatsAI">
            <Head title="Kirim Cepat - WhatsAI CRM" />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#ebe6dd]/10">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        Kirim Cepat
                        <span className="text-xs font-mono font-bold bg-[#e98425]/15 text-[#e98425] px-2.5 py-1 rounded-full border border-[#e98425]/30 flex items-center gap-1">
                            <Lightning className="w-3.5 h-3.5" weight="fill" /> Quick Send
                        </span>
                    </h1>
                    <p className="text-xs text-[#f5efe4]/60 mt-1">
                        Kirim pesan ke beberapa kontak/tujuan sekaligus secara instan tanpa membuat campaign.
                    </p>
                </div>
            </div>

            {/* Grid Layout (Form 6 cols, History 6 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT PANEL: Form Pengiriman & AI Assistant (6 Cols) */}
                <div className="lg:col-span-6 flex flex-col gap-6">
                    
                    <form onSubmit={handleSendQuick} className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-4">
                        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                            <Lightning className="w-4 h-4 text-[#e98425]" weight="fill" /> Form Kirim Cepat
                        </h2>

                        <div>
                            <label className="block text-xs font-mono font-[#f5efe4]/70 font-bold mb-1">
                                Nomor Tujuan WhatsApp <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Masukkan nomor HP (pisahkan dengan koma atau baris baru)&#10;Contoh: 6281222827630, 62895604631765"
                                value={recipients}
                                onChange={(e) => setRecipients(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425] font-mono"
                            />
                            <span className="text-[10.5px] text-[#f5efe4]/40 mt-1 block font-mono">
                                Masukkan format internasional tanpa tanda + (contoh: 628123456789).
                            </span>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-mono font-bold text-[#f5efe4]/70">
                                    Isi Pesan WhatsApp <span className="text-red-400">*</span>
                                </label>
                                <span className="text-[10.5px] font-mono text-[#f5efe4]/40">
                                    {messageText.length} karakter
                                </span>
                            </div>
                            <textarea
                                required
                                rows={5}
                                placeholder="Tuliskan isi pesan yang akan dikirim secara instan..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425] leading-relaxed"
                            />
                        </div>

                        {/* AI Polish Assistant */}
                        <div className="pt-2 border-t border-[#ebe6dd]/10">
                            <span className="text-[11px] font-mono font-bold text-[#f5efe4]/70 block mb-2 flex items-center gap-1.5">
                                <Sparkle className="w-3.5 h-3.5 text-[#e98425]" /> Asisten Penulisan AI ✦ AI Live
                            </span>
                            <p className="text-[11px] text-[#f5efe4]/50 mb-2">
                                Tulis pesan Anda di form editor di atas terlebih dahulu, lalu klik tombol gaya di bawah untuk memolesnya secara otomatis menggunakan AI.
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={() => applyAiStyle('ramah')}
                                    disabled={isAiLoading}
                                    className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    ✨ Poles Ramah
                                </button>
                                <button
                                    type="button"
                                    onClick={() => applyAiStyle('persuasif')}
                                    disabled={isAiLoading}
                                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    🔥 Poles Promo
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-[#e98425] hover:bg-[#d4741c] text-[#1a1714] text-xs font-extrabold shadow-lg shadow-[#e98425]/15 transition-all flex items-center justify-center gap-2 mt-2"
                        >
                            <PaperPlaneTilt className="w-4 h-4" weight="bold" />
                            Kirim Pesan Sekarang
                        </button>
                    </form>
                </div>

                {/* RIGHT PANEL: Riwayat Pengiriman (6 Cols) */}
                <div className="lg:col-span-6 bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-4">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#ebe6dd]/10">
                        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#e98425]" /> Riwayat Pengiriman
                        </h2>

                        <div className="relative w-full sm:w-44">
                            <MagnifyingGlass className="w-3.5 h-3.5 text-[#f5efe4]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text"
                                placeholder="Cari riwayat..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425]"
                            />
                        </div>
                    </div>

                    {/* Log Items List */}
                    {filteredLogs.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {filteredLogs.map((log) => (
                                <div 
                                    key={log.id}
                                    className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-2 hover:border-white/15 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono font-bold text-[#e98425] flex items-center gap-1.5">
                                            <WhatsappLogo className="w-3.5 h-3.5 text-emerald-400" weight="fill" />
                                            {log.recipient}
                                        </span>
                                        <span className="text-[10px] font-mono text-[#f5efe4]/40">
                                            {log.sentAt}
                                        </span>
                                    </div>

                                    <p className="text-xs text-white/80 leading-relaxed font-sans bg-[#0d0c0b] p-2.5 rounded-lg border border-white/5">
                                        "{log.message}"
                                    </p>

                                    <div className="flex items-center justify-between pt-1">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <CheckCircle className="w-3 h-3" /> Terkirim
                                        </span>

                                        <button 
                                            onClick={() => handleDeleteLog(log.id)}
                                            className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Hapus Riwayat"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-[#f5efe4]/40 text-xs font-sans">
                            Belum ada aktivitas pengiriman.
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
