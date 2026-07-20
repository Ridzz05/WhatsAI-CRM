import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    Broadcast, 
    PaperPlaneTilt, 
    Sparkle, 
    Clock, 
    ShieldCheck, 
    Shuffle, 
    Keyboard, 
    Timer, 
    PauseCircle, 
    Image, 
    LinkSimple, 
    Check, 
    CaretDown,
    WhatsappLogo,
    Info,
    ArrowClockwise
} from '@phosphor-icons/react';

export default function BroadcastPesan({ auth, broadcasts = [] }) {
    // Form States
    const [campaignTitle, setCampaignTitle] = useState('');
    const [content, setContent] = useState('');
    const [attachmentType, setAttachmentType] = useState('none'); // 'none', 'image', 'url'
    const [mediaUrl, setMediaUrl] = useState('');
    const [sendSchedule, setSendSchedule] = useState('');
    const [recurrencePattern, setRecurrencePattern] = useState('once');

    // Smart Blast Anti-Ban Protection Settings
    const [delayMin, setDelayMin] = useState(2);
    const [delayMax, setDelayMax] = useState(5);
    const [chunkSize, setChunkSize] = useState(10);
    const [pauseMin, setPauseMin] = useState(10);
    const [pauseMax, setPauseMax] = useState(20);

    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Variable insertion helper
    const insertVariable = (varName) => {
        setContent(prev => prev + ` {{${varName}}}`);
    };

    // AI Quick Polish Styles via Backend Endpoint
    const applyAiStyle = async (styleType) => {
        if (!content.trim()) return;
        setIsAiLoading(true);

        try {
            const res = await axios.post(route('api.ai.polish'), {
                text: content,
                style: styleType
            });

            if (res.data && res.data.polished_text) {
                setContent(res.data.polished_text);
            }
        } catch (e) {
            console.warn('AI Polish fallback active:', e.message);
            if (styleType === 'ramah') {
                setContent(`Halo kak! 😊 ${content} \n\nKalau ada pertanyaan, feel free untuk balas chat ini ya kak! 🙏`);
            } else if (styleType === 'persuasif') {
                setContent(`🔥 PROMO SPESIAL TERBATAS! 🔥\n\n${content}\n\nAmankan slot promo kakak sekarang juga sebelum kehabisan! 🚀`);
            }
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSubmitBroadcast = (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        router.post(route('crm.broadcast.store'), {
            title: campaignTitle,
            content: content,
            attachment_type: attachmentType,
            media_url: mediaUrl,
            send_schedule: sendSchedule || null,
            recurrence_pattern: recurrencePattern,
            delay_min: delayMin,
            delay_max: delayMax,
            chunk_size: chunkSize,
            pause_min: pauseMin,
            pause_max: pauseMax
        }, {
            onSuccess: () => {
                setCampaignTitle('');
                setContent('');
                setMediaUrl('');
                setSendSchedule('');
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <AdminLayout activeTab="broadcast" title="Buat Broadcast — WhatsAI">
            <Head title="Buat Broadcast - WhatsAI CRM" />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#ebe6dd]/10">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        Buat Broadcast
                        <span className="text-xs font-mono font-bold bg-[#e98425]/15 text-[#e98425] px-2.5 py-1 rounded-full border border-[#e98425]/30">
                            Smart Blast Engine
                        </span>
                    </h1>
                    <p className="text-xs text-[#f5efe4]/60 mt-1">
                        Kelola pengiriman pesan broadcast massal secara efisien dengan proteksi Anti-Ban cerdas.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmitBroadcast} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: Editor & Configurations (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    
                    {/* SECTION 1: Tulis Pesan Broadcast */}
                    <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-4">
                        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                            <Broadcast className="w-4 h-4 text-[#e98425]" /> Tulis Pesan Broadcast
                        </h2>

                        <div>
                            <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-1">
                                Judul Campaign <span className="text-[#f5efe4]/40 font-normal">(Opsional)</span>
                            </label>
                            <input 
                                type="text"
                                placeholder="Contoh: Promo Presales Palembang Square"
                                value={campaignTitle}
                                onChange={(e) => setCampaignTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425]"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-mono font-bold text-[#f5efe4]/70">
                                    Konten Utama <span className="text-red-400">*</span>
                                </label>
                                <span className="text-[10.5px] font-mono text-[#f5efe4]/40">
                                    {content.length} karakter
                                </span>
                            </div>

                            <textarea 
                                required
                                rows={6}
                                placeholder="Tulis pesan broadcast Anda di sini..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425] leading-relaxed"
                            />
                        </div>

                        {/* Variables Dropdown / Insertion */}
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                            <span className="text-[11px] font-mono text-[#f5efe4]/50">Sisipkan Variabel Dinamis:</span>
                            {['nama', 'nomor', 'tanggal', 'waktu'].map((v) => (
                                <button
                                    type="button"
                                    key={v}
                                    onClick={() => insertVariable(v)}
                                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-[#e98425] transition-all"
                                >
                                    +{'{' + '{' + v + '}' + '}'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SECTION 2: Lampiran Media / File */}
                    <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-4">
                        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                            <Image className="w-4 h-4 text-[#e98425]" /> Lampiran Media / File
                        </h2>

                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#f5efe4]/70 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="attachmentType" 
                                    value="none" 
                                    checked={attachmentType === 'none'} 
                                    onChange={() => setAttachmentType('none')} 
                                    className="accent-[#e98425]"
                                />
                                Tanpa Media
                            </label>
                            <label className="flex items-center gap-2 text-xs font-bold text-[#f5efe4]/70 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="attachmentType" 
                                    value="url" 
                                    checked={attachmentType === 'url'} 
                                    onChange={() => setAttachmentType('url')} 
                                    className="accent-[#e98425]"
                                />
                                URL Gambar / Link
                            </label>
                        </div>

                        {attachmentType === 'url' && (
                            <div>
                                <input 
                                    type="url"
                                    placeholder="https://domain.com/gambar-promo.jpg"
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425]"
                                />
                            </div>
                        )}
                    </div>

                    {/* SECTION 3: Jadwal Pengiriman */}
                    <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-4">
                        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#e98425]" /> Jadwal Pengiriman
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-1">
                                    Waktu Kirim <span className="text-[#f5efe4]/40 font-normal">(Kosongkan = Instan)</span>
                                </label>
                                <input 
                                    type="datetime-local"
                                    value={sendSchedule}
                                    onChange={(e) => setSendSchedule(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e98425]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-1">
                                    Pola Pengulangan
                                </label>
                                <select 
                                    value={recurrencePattern}
                                    onChange={(e) => setRecurrencePattern(e.target.value)}
                                    className="w-full bg-[#1a1714] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e98425]"
                                >
                                    <option value="once">Satu Kali</option>
                                    <option value="daily">Setiap Hari</option>
                                    <option value="weekly">Setiap Minggu</option>
                                    <option value="monthly">Setiap Bulan</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: Proteksi Anti-Ban (Smart Blast) */}
                    <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Proteksi Anti-Ban (Smart Blast)
                            </h2>
                            <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                                Protected
                            </span>
                        </div>

                        <p className="text-xs text-[#f5efe4]/60 leading-relaxed">
                            Fitur Smart Blast memperlambat pengiriman pesan secara acak dan membaginya ke dalam batch kecil (chunk) untuk meniru perilaku manusia agar aman dari deteksi spam WhatsApp.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-[#f5efe4]/70 mb-1">
                                    Jeda Antar Pesan (Detik)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={delayMin} 
                                        onChange={(e) => setDelayMin(Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center"
                                    />
                                    <span className="text-xs text-[#f5efe4]/40">s/d</span>
                                    <input 
                                        type="number" 
                                        min="2"
                                        value={delayMax} 
                                        onChange={(e) => setDelayMax(Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-[#f5efe4]/70 mb-1">
                                    Ukuran Batch (Chunk Size)
                                </label>
                                <input 
                                    type="number" 
                                    value={chunkSize} 
                                    onChange={(e) => setChunkSize(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-mono font-bold text-[#f5efe4]/70 mb-1">
                                    Jeda Istirahat Batch (Detik)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={pauseMin} 
                                        onChange={(e) => setPauseMin(Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center"
                                    />
                                    <span className="text-xs text-[#f5efe4]/40">s/d</span>
                                    <input 
                                        type="number" 
                                        value={pauseMax} 
                                        onChange={(e) => setPauseMax(Number(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: Asisten Penulisan AI */}
                    <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-3">
                        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                            <Sparkle className="w-4 h-4 text-[#e98425]" /> Asisten Penulisan AI ✦ AI Live
                        </h2>
                        <p className="text-xs text-[#f5efe4]/60">
                            Tulis pesan Anda di form editor utama terlebih dahulu, lalu klik tombol gaya di bawah untuk memolesnya secara otomatis menggunakan AI.
                        </p>

                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                            <button
                                type="button"
                                onClick={() => applyAiStyle('ramah')}
                                disabled={isAiLoading}
                                className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold transition-all disabled:opacity-50"
                            >
                                ✨ Poles Ramah & Soft
                            </button>
                            <button
                                type="button"
                                onClick={() => applyAiStyle('persuasif')}
                                disabled={isAiLoading}
                                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all disabled:opacity-50"
                            >
                                🔥 Poles Persuasif (Promo)
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: WhatsApp Preview & Anti-Ban Mode Info (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col gap-6 sticky top-6">
                    
                    {/* WhatsApp Chat Preview Phone Mockup */}
                    <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col items-center">
                        <div className="w-full flex items-center justify-between pb-3 border-b border-[#ebe6dd]/10 mb-4">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                                <WhatsappLogo className="w-4 h-4 text-emerald-400" weight="fill" /> Pratinjau Pesan WA
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                Online
                            </span>
                        </div>

                        {/* WA Chat Bubble Container */}
                        <div className="w-full bg-[#0b141a] rounded-2xl p-4 border border-white/10 shadow-2xl min-h-[180px] flex flex-col justify-end">
                            <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-sans leading-relaxed relative max-w-[90%] self-end shadow-md">
                                {mediaUrl && (
                                    <img 
                                        src={mediaUrl} 
                                        alt="Media Preview" 
                                        className="w-full h-32 object-cover rounded-lg mb-2"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                )}
                                <p className="whitespace-pre-line font-sans leading-relaxed">
                                    {content.trim() || 'Tulis draf pesan untuk memunculkan pratinjau di sini...'}
                                </p>
                                <span className="text-[9.5px] text-white/60 text-right block mt-1 font-mono">
                                    22:48 ✓✓
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mode Anti-Banned Aktif Card */}
                    <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-[#ebe6dd]/10 pb-3">
                            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Mode Anti-Banned Aktif
                            </h3>
                            <span className="text-[10px] font-mono text-emerald-400">Aman & Natural</span>
                        </div>

                        <div className="flex flex-col gap-3 text-xs">
                            <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                <Shuffle className="w-4 h-4 text-[#e98425] shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold text-white block">Urutan Diacak</span>
                                    <span className="text-[11px] text-[#f5efe4]/50 leading-tight block mt-0.5">
                                        Daftar penerima diacak sebelum dikirim agar polanya tidak terdeteksi sistem WhatsApp.
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                <Keyboard className="w-4 h-4 text-[#e98425] shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold text-white block">Simulasi Mengetik</span>
                                    <span className="text-[11px] text-[#f5efe4]/50 leading-tight block mt-0.5">
                                        Sebelum setiap pesan terkirim, sistem mensimulasikan status "sedang mengetik..." selama 1–4 detik.
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                <Timer className="w-4 h-4 text-[#e98425] shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold text-white block">Jeda Acak Antar Pesan</span>
                                    <span className="text-[11px] text-[#f5efe4]/50 leading-tight block mt-0.5">
                                        Setiap pesan diberi jeda acak {delayMin}–{delayMax} detik agar tidak kaku.
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                <PauseCircle className="w-4 h-4 text-[#e98425] shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold text-white block">Istirahat Tiap {chunkSize} Pesan</span>
                                    <span className="text-[11px] text-[#f5efe4]/50 leading-tight block mt-0.5">
                                        Setelah setiap {chunkSize} pesan, sistem istirahat {pauseMin}–{pauseMax} detik agar tidak terdeteksi spam.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-[#ebe6dd]/10 text-center">
                            <span className="text-[10.5px] font-mono text-[#f5efe4]/40">
                                ℹ️ Proses berjalan di <strong>background</strong>. Anda bisa menutup halaman ini dan broadcast tetap berjalan.
                            </span>
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 rounded-xl bg-[#e98425] hover:bg-[#d4741c] text-[#1a1714] text-xs font-extrabold shadow-lg shadow-[#e98425]/15 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                        >
                            <PaperPlaneTilt className="w-4 h-4" weight="bold" />
                            {isSubmitting ? 'Memproses Broadcast...' : 'Mulai Pengiriman Broadcast'}
                        </button>
                    </div>
                </div>

            </form>
        </AdminLayout>
    );
}
