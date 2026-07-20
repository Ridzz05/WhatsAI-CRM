import { useState, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import Alert from '@/Components/Alert';
import ConfirmModal from '@/Components/ConfirmModal';
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
    FileText,
    X,
    FileCsv,
    Check,
    WarningCircle,
    Info
} from '@phosphor-icons/react';

export default function QuickSend({ auth, logs = [] }) {
    const { flash } = usePage().props;

    // Form States
    const [selectedChannel, setSelectedChannel] = useState('openwa');
    const [recipients, setRecipients] = useState('');
    const [messageText, setMessageText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [activeAiTab, setActiveAiTab] = useState('gaya'); // 'gaya', 'buat', 'audit'
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [alertData, setAlertData] = useState(null);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    const fileInputRef = useRef(null);
    const contactFileRef = useRef(null);

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

    // File Attachment Handler
    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) {
                setAlertData({
                    type: 'warning',
                    title: 'Ukuran Berkas Terlalu Besar',
                    message: 'Ukuran maksimum berkas lampiran adalah 10 MB.'
                });
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleClearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Import Contacts File Handler (.txt / .csv)
    const handleImportContacts = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                if (text) {
                    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                    const formatted = lines.join('\n');
                    setRecipients(prev => (prev ? prev + '\n' + formatted : formatted));
                    setAlertData({
                        type: 'success',
                        title: 'BERHASIL IMPORT KONTAK',
                        message: `Berhasil mengimpor ${lines.length} kontak dari file ${file.name}.`
                    });
                }
            };
            reader.readAsText(file);
        }
    };

    // Real-time AI Style Polish via Backend Endpoint (/api/ai/polish)
    const applyAiStyle = async (styleType) => {
        if (!messageText.trim()) return;
        setIsAiLoading(true);

        try {
            const res = await axios.post(route('api.ai.polish'), {
                text: messageText,
                style: styleType
            });

            if (res.data && res.data.polished_text) {
                setMessageText(res.data.polished_text);
            }
        } catch (e) {
            // Client-side fallback if offline
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
        } finally {
            setIsAiLoading(false);
        }
    };

    // AI Template Generator
    const applyAiTemplate = (templateType) => {
        if (templateType === 'presales') {
            setMessageText(`🔥 PROMO PRESALES LOYAL FITNESS PRIME PALEMBANG SQUARE 🔥\n\nHalo {{nama}},\nLoyal Fitness Prime di Palembang Square akan segera dibuka dengan konsep 24 Jam & Fasilitas Premium! 🏋️‍♂️\n\nNikmati diskon khusus presales sebelum harga normal naik saat opening. Kuota terbatas!\n\nBalas CHAT ini atau pesan jadwal konsultasi Anda sekarang! 👍`);
        } else if (templateType === 'trial') {
            setMessageText(`💪 UNDANGAN SESI FREE TRIAL LOYAL FITNESS 💪\n\nHalo {{nama}},\nYuk coba fasilitas gym lengkap dan bonus konsultasi latihan gratis di Loyal Fitness Palembang!\n\nKapan ada waktu senggang minggu ini? Kakak bisa langsung atur jadwal visit bersama coach kami. 😊`);
        } else if (templateType === 'followup') {
            setMessageText(`Halo {{nama}}! 👋\n\nBagaimana kabar rencana latihan fitnessnya kak? Ada promo menarik paket membership bulanan & bonus Personal Trainer yang baru di-release minggu ini lho.\n\nMau dibantu cek promonya? 😊`);
        }
    };

    // Live Audit Message Calculation
    const getMessageAudit = () => {
        const len = messageText.length;
        const hasNameVar = messageText.includes('{{nama}}');
        const hasNumberVar = messageText.includes('{{nomor}}');
        
        let spamRisk = 'Rendah';
        let spamColor = 'text-emerald-400';
        if (len > 800 || (messageText.match(/!/g) || []).length > 5) {
            spamRisk = 'Tinggi';
            spamColor = 'text-red-400';
        } else if (len > 400 || (messageText.match(/PROMO|DISKON|GRATIS/g) || []).length > 3) {
            spamRisk = 'Sedang';
            spamColor = 'text-amber-400';
        }

        return { len, hasNameVar, hasNumberVar, spamRisk, spamColor };
    };

    // Live Form Submission to Laravel Backend
    const handleSendQuick = (e) => {
        e.preventDefault();
        if (!recipients.trim() || !messageText.trim()) return;

        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('recipients', recipients);
        formData.append('message', messageText);
        formData.append('channel', selectedChannel);
        if (selectedFile) {
            formData.append('attachment', selectedFile);
        }

        router.post(route('crm.quick-send.send'), formData, {
            onSuccess: () => {
                setRecipients('');
                setMessageText('');
                handleClearFile();
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    const confirmDeleteLog = () => {
        if (deleteTargetId) {
            router.delete(route('crm.quick-send.destroy', deleteTargetId));
            setDeleteTargetId(null);
            setAlertData({
                type: 'success',
                title: 'Riwayat Dihapus',
                message: 'Riwayat pengiriman berhasil dihapus dari database.'
            });
        }
    };

    const filteredLogs = logs.filter(l => 
        (l.phone && l.phone.includes(searchQuery)) || 
        (l.name && l.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.message && l.message.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const auditInfo = getMessageAudit();

    return (
        <AdminLayout activeTab="quicksend" title="Kirim Cepat (Quick Send) — WhatsAI">
            <Head title="Kirim Cepat (Quick Send) - WhatsAI CRM" />

            {/* Reusable Breadcrumb Component */}
            <Breadcrumb items={[{ label: 'Kirim Cepat (Quick Send)' }]} />

            {/* Alert Notifications */}
            {(flash?.success || alertData) && (
                <div className="mb-4">
                    <Alert 
                        type={alertData ? alertData.type : 'success'}
                        title={alertData ? alertData.title : 'BERHASIL'}
                        message={alertData ? alertData.message : flash.success}
                        onClose={() => setAlertData(null)}
                    />
                </div>
            )}

            {/* Reusable ConfirmModal for Log Deletion */}
            <ConfirmModal 
                isOpen={!!deleteTargetId}
                title="Hapus Riwayat Pengiriman?"
                message="Apakah Anda yakin ingin menghapus catatan riwayat pengiriman ini secara permanen?"
                confirmText="Ya, Hapus"
                cancelText="Batal"
                type="danger"
                onConfirm={confirmDeleteLog}
                onCancel={() => setDeleteTargetId(null)}
            />

            {/* Page Header */}
            <div className="pb-4 border-b border-[#ebe6dd]/10 mb-6">
                <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <Lightning className="w-7 h-7 text-[#e98425]" />
                    <span>Kirim Cepat (Quick Send)</span>
                </h1>
                <p className="text-xs text-[#f5efe4]/60 mt-1">
                    Kirim pesan ke beberapa kontak/tujuan sekaligus secara instan tanpa membuat campaign.
                </p>
            </div>

            {/* Main Grid (Left Form 7 Cols, Right History 5 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN: Main Form & AI Assistant (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                    
                    <form onSubmit={handleSendQuick} className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
                        
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

                        {/* 2. NOMOR TUJUAN / KONTAK PENERIMA & IMPORT */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#f5efe4]/70">
                                    NOMOR TUJUAN / KONTAK PENERIMA
                                </label>
                                <button
                                    type="button"
                                    onClick={() => contactFileRef.current?.click()}
                                    className="text-[11px] font-mono text-[#e98425] hover:text-[#e98425]/80 flex items-center gap-1 cursor-pointer"
                                >
                                    <FileCsv className="w-4 h-4" />
                                    <span>Import File (.csv / .txt)</span>
                                </button>
                                <input 
                                    type="file" 
                                    ref={contactFileRef}
                                    onChange={handleImportContacts}
                                    accept=".csv,.txt"
                                    className="hidden"
                                />
                            </div>
                            <textarea
                                required
                                rows={4}
                                placeholder="Masukkan nomor telepon (format: 628xxx) atau target ID lainnya.&#10;Gunakan koma atau baris baru untuk memisahkan banyak tujuan.&#10;Contoh: 628123456789|Budi"
                                value={recipients}
                                onChange={(e) => setRecipients(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425] font-mono leading-relaxed"
                            />
                            <span className="text-[11px] text-[#f5efe4]/40 mt-1.5 block font-mono">
                                Gunakan format <code className="bg-white/10 px-1 py-0.5 rounded text-[#e98425]">nomor|nama</code> untuk variabel dinamis.
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
                                            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10.5px] font-mono text-[#e98425] transition-all cursor-pointer"
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
                                        className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors cursor-pointer"
                                        title="Bold (Tebal)"
                                    >
                                        <TextB className="w-4 h-4" />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => insertFormat('i')} 
                                        className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors cursor-pointer"
                                        title="Italic (Miring)"
                                    >
                                        <TextItalic className="w-4 h-4" />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => insertFormat('s')} 
                                        className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors cursor-pointer"
                                        title="Strikethrough (Coret)"
                                    >
                                        <TextStrikethrough className="w-4 h-4" />
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => insertFormat('code')} 
                                        className="p-1.5 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors cursor-pointer"
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
                                        disabled={isAiLoading}
                                        className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        ✨ Optimalkan
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => applyAiStyle('marketing')}
                                        disabled={isAiLoading}
                                        className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        🔥 Marketing
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => applyAiStyle('santai')}
                                        disabled={isAiLoading}
                                        className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        🥤 Santai
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

                        {/* 4. MEDIA / LAMPIRAN (REAL FILE UPLOAD) */}
                        <div>
                            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-[#f5efe4]/70 mb-1.5">
                                MEDIA / LAMPIRAN (GAMBAR ATAU DOKUMEN)
                            </label>
                            
                            <input 
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept="image/*,.pdf,.doc,.docx"
                                className="hidden"
                            />

                            {selectedFile ? (
                                <div className="w-full bg-[#1a1714] border border-[#e98425]/30 rounded-xl p-3.5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-[#e98425]" />
                                        <div>
                                            <p className="text-xs font-bold text-white">{selectedFile.name}</p>
                                            <p className="text-[11px] text-[#f5efe4]/50 font-mono">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Berkas Lampiran'}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={handleClearFile}
                                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                        title="Hapus Lampiran"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full border-2 border-dashed border-white/15 rounded-xl p-4 text-center cursor-pointer hover:border-[#e98425]/50 transition-colors flex items-center justify-center gap-2 bg-white/5"
                                >
                                    <UploadSimple className="w-4 h-4 text-[#e98425]" />
                                    <span className="text-xs text-[#f5efe4]/60 font-medium">
                                        Klik untuk memilih file Gambar (.jpg, .png) atau Dokumen (.pdf)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* 5. ACTION BUTTON */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-extrabold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <PaperPlaneTilt className="w-4 h-4" weight="bold" />
                            {isSubmitting ? 'Mengirim Pesan...' : 'Kirim Sekarang'}
                        </button>

                    </form>

                    {/* 6. ASISTEN PENULISAN AI INTERAKTIF (✦ AI Live Card) */}
                    <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                                <Sparkle className="w-4 h-4 text-[#e98425]" /> ASISTEN PENULISAN AI
                            </span>
                            <span className="text-[10px] font-mono font-bold bg-[#e98425]/15 text-[#e98425] px-2 py-0.5 rounded border border-[#e98425]/30">
                                ✦ AI Live Panel
                            </span>
                        </div>

                        {/* AI Sub-Tabs */}
                        <div className="flex items-center bg-[#0d0c0b] border border-white/10 rounded-xl p-1">
                            {['gaya', 'buat', 'audit'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setActiveAiTab(t)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                                        activeAiTab === t
                                            ? 'bg-white text-[#1a1714] shadow-md'
                                            : 'text-[#f5efe4]/50 hover:text-white'
                                    }`}
                                >
                                    {t === 'gaya' ? 'Gaya Bahasa' : t === 'buat' ? 'Buat Baru' : 'Audit Pesan'}
                                </button>
                            ))}
                        </div>

                        {/* TAB 1: GAYA BAHASA */}
                        {activeAiTab === 'gaya' && (
                            <div className="space-y-3">
                                <p className="text-xs text-[#f5efe4]/60 leading-relaxed">
                                    Poles pesan di editor utama menggunakan gaya bahasa pilihan AI di bawah ini:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {[
                                        { key: 'marketing', label: '🔥 Marketing' },
                                        { key: 'formal', label: '💼 Formal' },
                                        { key: 'santai', label: '🥤 Santai' },
                                        { key: 'profesional', label: '📈 Profesional' },
                                        { key: 'mendesak', label: '🚨 Mendesak' },
                                        { key: 'ramah', label: '🤗 Ramah' },
                                    ].map((style) => (
                                        <button
                                            key={style.key}
                                            type="button"
                                            onClick={() => applyAiStyle(style.key)}
                                            disabled={isAiLoading}
                                            className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white font-medium flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB 2: BUAT BARU TEMPLATE */}
                        {activeAiTab === 'buat' && (
                            <div className="space-y-3">
                                <p className="text-xs text-[#f5efe4]/60 leading-relaxed">
                                    Pilih template siap pakai dari AI untuk disisipkan ke dalam editor pesan:
                                </p>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => applyAiTemplate('presales')}
                                        className="p-3 text-left rounded-xl bg-white/5 hover:bg-[#e98425]/10 border border-white/10 hover:border-[#e98425]/30 text-xs text-white transition-all cursor-pointer"
                                    >
                                        <div className="font-bold text-[#e98425] mb-0.5">🔥 Promo Presales Palembang Square</div>
                                        <div className="text-[11px] text-[#f5efe4]/60">Template penawaran diskon khusus 24 Jam Presales PS.</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => applyAiTemplate('trial')}
                                        className="p-3 text-left rounded-xl bg-white/5 hover:bg-[#e98425]/10 border border-white/10 hover:border-[#e98425]/30 text-xs text-white transition-all cursor-pointer"
                                    >
                                        <div className="font-bold text-[#e98425] mb-0.5">💪 Undangan Free Trial Workout</div>
                                        <div className="text-[11px] text-[#f5efe4]/60">Template mengajak calon member mencoba sesi gym gratis.</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => applyAiTemplate('followup')}
                                        className="p-3 text-left rounded-xl bg-white/5 hover:bg-[#e98425]/10 border border-white/10 hover:border-[#e98425]/30 text-xs text-white transition-all cursor-pointer"
                                    >
                                        <div className="font-bold text-[#e98425] mb-0.5">👋 Follow-Up Lead Cold</div>
                                        <div className="text-[11px] text-[#f5efe4]/60">Template follow-up ramah untuk kontak yang belum merespon.</div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: AUDIT PESAN */}
                        {activeAiTab === 'audit' && (
                            <div className="space-y-3 bg-[#0d0c0b] p-4 rounded-xl border border-white/10 font-mono text-xs">
                                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                    <span className="text-[#f5efe4]/70">Panjang Pesan:</span>
                                    <span className="font-bold text-white">{auditInfo.len} Karakter</span>
                                </div>

                                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                    <span className="text-[#f5efe4]/70">Variabel {"{{nama}}"}:</span>
                                    <span className={auditInfo.hasNameVar ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                        {auditInfo.hasNameVar ? '✅ Ditemukan' : '⚠️ Tidak Ada'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                                    <span className="text-[#f5efe4]/70">Skor Risiko Spam:</span>
                                    <span className={`font-bold ${auditInfo.spamColor}`}>
                                        {auditInfo.spamRisk}
                                    </span>
                                </div>

                                <div className="text-[11px] text-[#f5efe4]/50 leading-relaxed pt-1">
                                    💡 <b>Saran AI:</b> Gunakan variabel <code className="text-[#e98425]">{"{{nama}}"}</code> dan hindari pemakaian tanda seru (!) berlebihan untuk mencegah pesan ditandai spam oleh WhatsApp.
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT COLUMN: RIWAYAT PENGIRIMAN (5 Cols) */}
                <div className="lg:col-span-5 bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 min-h-[480px] flex flex-col justify-start shadow-xl">
                    
                    <div className="flex items-center justify-between mb-4 border-b border-[#ebe6dd]/10 pb-3">
                        <h2 className="text-xs font-extrabold text-[#f5efe4]/80 uppercase tracking-wider">
                            RIWAYAT PENGIRIMAN
                        </h2>
                        <div className="relative">
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari..."
                                className="bg-[#1a1714] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-white/30 focus:outline-none focus:border-[#e98425]"
                            />
                        </div>
                    </div>

                    {filteredLogs.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {filteredLogs.map((log) => (
                                <div 
                                    key={log.id}
                                    className="bg-white/5 border border-white/5 rounded-xl p-3.5 flex flex-col gap-2 hover:border-white/15 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono font-bold text-[#e98425] flex items-center gap-1">
                                            <WhatsappLogo className="w-3.5 h-3.5 text-emerald-400" weight="fill" />
                                            {log.phone} ({log.name || 'Pelanggan'})
                                        </span>
                                        <span className="text-[10px] font-mono text-[#f5efe4]/40">
                                            {log.sent_at || log.created_at || 'Baru saja'}
                                        </span>
                                    </div>

                                    <p className="text-xs text-white/80 leading-relaxed bg-[#0d0c0b] p-2.5 rounded-lg border border-white/5 font-sans">
                                        "{log.message}"
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-mono ${
                                            log.status === 'terkirim' ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                            <CheckCircle className="w-3 h-3" /> {log.status === 'terkirim' ? 'Terkirim' : 'Gagal'}
                                        </span>
                                        <button 
                                            onClick={() => setDeleteTargetId(log.id)}
                                            className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
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
