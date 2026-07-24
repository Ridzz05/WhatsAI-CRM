import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { 
    Broadcast as BroadcastIcon, 
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
    ArrowClockwise,
    Info
} from '@phosphor-icons/react';

export default function BroadcastPesan({ auth, broadcasts = [] }) {
    // Form States
    const [campaignTitle, setCampaignTitle] = useState('');
    const [content, setContent] = useState('');
    const [attachmentType, setAttachmentType] = useState('none');
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

    const insertVariable = (varName) => {
        setContent(prev => prev + ` {{${varName}}}`);
    };

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

            <div className="space-y-6 relative z-10 p-1">
                {/* Header Banner */}
                <div className="bg-[#1a1714] border border-[#ebe6dd]/10 p-6 rounded-[24px] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="eyebrow-badge mb-3">
                            <span className="dot"></span>Smart Blast Engine
                        </span>
                        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-2">
                            <BroadcastIcon className="w-7 h-7 text-[#e98425]" />
                            Pengiriman Pesan <span className="serif-title italic text-[#e98425]">Broadcast Massal</span>
                        </h1>
                        <p className="text-xs text-[#f5efe4]/50 leading-relaxed mt-1">
                            Kirim pesan promosi massal ke ribuan kontak pelanggan secara efisien dengan proteksi Anti-Ban cerdas.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmitBroadcast} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* LEFT COLUMN: Editor & Form (7 Cols) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                        <div className="bg-[#1a1714] border border-[#ebe6dd]/10 rounded-[24px] p-6 shadow-lg flex flex-col gap-4">
                            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                                <PaperPlaneTilt className="w-5 h-5 text-[#e98425]" /> Editor Pesan Broadcast
                            </h2>

                            <div>
                                <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-1">
                                    Judul Campaign <span className="text-[#f5efe4]/40 font-normal">(Opsional)</span>
                                </label>
                                <input 
                                    type="text"
                                    placeholder="Contoh: Promo Flash Sale Akhir Bulan IP Mall"
                                    value={campaignTitle}
                                    onChange={(e) => setCampaignTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#e98425] text-white rounded-xl py-2.5 px-3 text-xs outline-none transition-all"
                                />
                            </div>

                            {/* Variable Chips */}
                            <div>
                                <label className="block text-[11px] font-mono font-bold text-[#f5efe4]/50 mb-1.5 uppercase tracking-wider">
                                    Sisipkan Variabel Pelanggan
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {['nama', 'telepon', 'cabang', 'status'].map((v) => (
                                        <button
                                            key={v}
                                            type="button"
                                            onClick={() => insertVariable(v)}
                                            className="px-2.5 py-1 bg-white/5 hover:bg-[#e98425]/15 border border-white/10 hover:border-[#e98425]/30 text-white rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <Keyboard className="w-3 h-3 text-[#e98425]" /> {`{{${v}}}`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Text Area */}
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="block text-xs font-mono font-bold text-[#f5efe4]/70">
                                        Isi Pesan Broadcast *
                                    </label>
                                    <span className="text-[10px] font-mono text-[#f5efe4]/40">
                                        {content.length} karakter
                                    </span>
                                </div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows="6"
                                    placeholder="Tulis pesan promosi Anda di sini. Gunakan emoji untuk menarik perhatian calon member..."
                                    required
                                    className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#e98425] text-white rounded-2xl py-3 px-4 text-xs outline-none resize-y leading-relaxed transition-all"
                                />
                            </div>

                            {/* AI Quick Polish */}
                            <div className="bg-[#24201c] p-3.5 rounded-2xl border border-white/5 flex flex-col gap-2">
                                <div className="flex items-center gap-1.5 text-xs font-extrabold text-white">
                                    <Sparkle className="w-4 h-4 text-[#e98425]" /> AI Quick Style Refiner
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        disabled={isAiLoading}
                                        onClick={() => applyAiStyle('ramah')}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-emerald-500/20 text-emerald-400 border border-white/10 rounded-xl text-xs font-semibold transition"
                                    >
                                        😊 Buat Ramah
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isAiLoading}
                                        onClick={() => applyAiStyle('persuasif')}
                                        className="px-3 py-1.5 bg-white/5 hover:bg-amber-500/20 text-amber-400 border border-white/10 rounded-xl text-xs font-semibold transition"
                                    >
                                        🔥 Buat Persuasif
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: Media Attachment & Schedule */}
                        <div className="bg-[#1a1714] border border-[#ebe6dd]/10 rounded-[24px] p-6 shadow-lg flex flex-col gap-4">
                            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#e98425]" /> Lampiran & Jadwal Pengiriman
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-1">Tipe Lampiran</label>
                                    <select
                                        value={attachmentType}
                                        onChange={(e) => setAttachmentType(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2.5 px-3 text-xs outline-none"
                                    >
                                        <option value="none" className="bg-[#1a1714]">Tanpa Lampiran (Teks)</option>
                                        <option value="image" className="bg-[#1a1714]">Gambar / Banner Promo</option>
                                        <option value="url" className="bg-[#1a1714]">Link Brosur PDF / Video</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-1">Jadwal Kirim (Opsional)</label>
                                    <input
                                        type="datetime-local"
                                        value={sendSchedule}
                                        onChange={(e) => setSendSchedule(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2 px-3 text-xs outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Anti-Ban Settings & Live Preview (5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        
                        {/* Anti-Ban Config */}
                        <div className="bg-[#1a1714] border border-[#ebe6dd]/10 rounded-[24px] p-6 shadow-lg flex flex-col gap-4">
                            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Pengaturan Anti-Ban Cerdas
                            </h2>
                            <p className="text-xs text-[#f5efe4]/50 leading-relaxed">
                                Fitur ini mengacak jeda pengiriman pesan agar WhatsApp membaca aktivitas Anda sebagai obrolan manusia normal.
                            </p>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div>
                                    <label className="block text-[11px] font-mono text-[#f5efe4]/60">Delay Min (detik)</label>
                                    <input
                                        type="number"
                                        value={delayMin}
                                        onChange={(e) => setDelayMin(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2 px-3 text-xs outline-none mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono text-[#f5efe4]/60">Delay Max (detik)</label>
                                    <input
                                        type="number"
                                        value={delayMax}
                                        onChange={(e) => setDelayMax(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2 px-3 text-xs outline-none mt-1"
                                    />
                                </div>
                            </div>

                            <PrimaryButton type="submit" disabled={isSubmitting} className="w-full justify-center mt-4">
                                {isSubmitting ? 'Mengirim Broadcast...' : '🚀 Luncurkan Broadcast Massal'}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
