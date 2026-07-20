import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    PaperPlaneTilt, 
    Eye, 
    ArrowClockwise, 
    CalendarBlank, 
    Clock, 
    Image, 
    CheckCircle, 
    XCircle,
    MagnifyingGlass,
    Trash,
    Circle,
    Sparkle
} from '@phosphor-icons/react';

export default function JadwalStatus({ auth, statuses = [] }) {
    const [activeTab, setActiveTab] = useState('buat'); // 'buat' or 'preview'
    const [historyTab, setHistoryTab] = useState('semua'); // 'terjadwal', 'terkirim', 'gagal', 'semua'
    const [searchQuery, setSearchQuery] = useState('');
    
    // Form State for creating WA Status
    const [statusText, setStatusText] = useState('');
    const [bgColor, setBgColor] = useState('#075e54'); // Default WA Green
    const [scheduledAt, setScheduledAt] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const colorOptions = [
        { name: 'WA Green', hex: '#075e54' },
        { name: 'Deep Teal', hex: '#128c7e' },
        { name: 'Royal Purple', hex: '#6b21a8' },
        { name: 'Crimson Red', hex: '#991b1b' },
        { name: 'Midnight Blue', hex: '#1e3a8a' },
        { name: 'Amber Gold', hex: '#b45309' }
    ];

    const handleCreateStatus = (e) => {
        e.preventDefault();
        if (!statusText.trim()) return;

        setIsSubmitting(true);
        router.post(route('crm.status.store'), {
            text: statusText,
            bg_color: bgColor,
            scheduled_at: scheduledAt || null
        }, {
            onSuccess: () => {
                setStatusText('');
                setScheduledAt('');
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleDeleteStatus = (id) => {
        if (confirm('Hapus jadwal status ini?')) {
            router.delete(route('crm.status.destroy', id));
        }
    };

    const filteredStatuses = statuses.filter(s => {
        const matchesTab = historyTab === 'semua' || s.status === historyTab;
        const matchesSearch = s.text && s.text.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <AdminLayout activeTab="status" title="Jadwal Status WhatsApp">
            <Head title="Jadwal Status WA - WhatsAI CRM" />

            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#ebe6dd]/10">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        Jadwal Status WhatsApp
                        <span className="text-xs font-mono font-bold bg-[#e98425]/15 text-[#e98425] px-2.5 py-1 rounded-full border border-[#e98425]/30">
                            WA Story Automation
                        </span>
                    </h1>
                    <p className="text-xs text-[#f5efe4]/60 mt-1">
                        Jadwalkan posting status teks atau media ke WhatsApp Story secara otomatis untuk promosi & branding.
                    </p>
                </div>

                <button 
                    onClick={() => router.reload()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all"
                >
                    <ArrowClockwise className="w-4 h-4" weight="bold" />
                    Refresh
                </button>
            </div>

            {/* Grid Layout: Left Create/Preview & Right History */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Panel: Create Form & Real-time Phone Story Preview (5 cols) */}
                <div className="lg:col-span-5 bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl overflow-hidden flex flex-col">
                    
                    {/* Tab Selector */}
                    <div className="flex items-center border-b border-[#ebe6dd]/10 bg-[#0d0c0b] p-1.5">
                        <button
                            onClick={() => setActiveTab('buat')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'buat'
                                    ? 'bg-[#e98425] text-[#1a1714] font-extrabold shadow-md'
                                    : 'text-[#f5efe4]/60 hover:text-white'
                            }`}
                        >
                            <PaperPlaneTilt className="w-4 h-4" weight="bold" />
                            Buat Status
                        </button>
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                activeTab === 'preview'
                                    ? 'bg-[#e98425] text-[#1a1714] font-extrabold shadow-md'
                                    : 'text-[#f5efe4]/60 hover:text-white'
                            }`}
                        >
                            <Eye className="w-4 h-4" weight="bold" />
                            Preview WA Story
                        </button>
                    </div>

                    {/* Form Section */}
                    {activeTab === 'buat' ? (
                        <form onSubmit={handleCreateStatus} className="p-5 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-1.5">
                                    Teks Status WhatsApp
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Tuliskan isi status WhatsApp yang ingin diposting..."
                                    value={statusText}
                                    onChange={(e) => setStatusText(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425] transition-colors"
                                />
                            </div>

                            {/* Color Selector */}
                            <div>
                                <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-2">
                                    Pilih Warna Background Status
                                </label>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {colorOptions.map((c) => (
                                        <button
                                            type="button"
                                            key={c.hex}
                                            onClick={() => setBgColor(c.hex)}
                                            style={{ backgroundColor: c.hex }}
                                            className={`w-7 h-7 rounded-full border-2 transition-transform ${
                                                bgColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                                            }`}
                                            title={c.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Schedule Time Input */}
                            <div>
                                <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-1.5 flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-[#e98425]" /> Waktu Pengiriman (Opsional untuk Jadwal)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={(e) => setScheduledAt(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e98425]"
                                />
                                <span className="text-[10.5px] text-[#f5efe4]/40 mt-1 block font-mono">
                                    Biarkan kosong jika ingin langsung memposting status sekarang.
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 rounded-xl bg-[#e98425] hover:bg-[#d4741c] text-[#1a1714] text-xs font-extrabold shadow-lg shadow-[#e98425]/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Sparkle className="w-4 h-4" weight="bold" />
                                {isSubmitting ? 'Memproses...' : scheduledAt ? 'Simpan & Jadwalkan Status' : 'Post Status Sekarang'}
                            </button>
                        </form>
                    ) : (
                        /* WA Story Phone Preview Section */
                        <div className="p-6 flex flex-col items-center justify-center bg-[#0d0c0b]">
                            <span className="text-[11px] font-mono text-[#f5efe4]/50 mb-4">
                                Preview tampilan status WhatsApp secara real-time
                            </span>

                            {/* Mobile Device Frame */}
                            <div className="w-64 h-[440px] rounded-[32px] border-4 border-white/15 shadow-2xl p-3 flex flex-col justify-between relative overflow-hidden transition-all"
                                style={{ backgroundColor: bgColor }}
                            >
                                {/* Story Header Bar */}
                                <div>
                                    <div className="flex gap-1 mb-2">
                                        <div className="h-0.5 flex-1 bg-white rounded-full" />
                                        <div className="h-0.5 flex-1 bg-white/40 rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-[10px]">
                                            WA
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <span className="text-white font-bold text-xs">Status Saya</span>
                                            <span className="text-white/60 text-[9px]">Baru saja</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Text Message Container */}
                                <div className="my-auto px-4 text-center">
                                    <p className="text-white font-bold text-sm leading-relaxed whitespace-pre-line drop-shadow-md font-sans">
                                        {statusText.trim() || 'Tulis status di tab Buat Status...'}
                                    </p>
                                </div>

                                {/* Reply Footer */}
                                <div className="text-center pb-1">
                                    <span className="text-white/70 text-[9px] block">∧</span>
                                    <span className="text-white/70 text-[9px] font-medium">Balas</span>
                                </div>
                            </div>

                            <span className="text-xs font-mono text-white/50 mt-4 flex items-center gap-1.5">
                                Background: <span className="font-bold text-white" style={{ color: bgColor }}>● Selected Color</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Right Panel: Jadwal & Riwayat Status Table (7 cols) */}
                <div className="lg:col-span-7 bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col gap-5">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#ebe6dd]/10">
                        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                            Jadwal & Riwayat Status
                        </h2>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-48">
                            <MagnifyingGlass className="w-3.5 h-3.5 text-[#f5efe4]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text"
                                placeholder="Cari status..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425]"
                            />
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 pb-2 border-b border-[#ebe6dd]/10">
                        {['terjadwal', 'terkirim', 'gagal', 'semua'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setHistoryTab(tab)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                                    historyTab === tab 
                                        ? 'bg-[#e98425] text-[#1a1714]' 
                                        : 'text-[#f5efe4]/50 hover:text-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Status History Cards */}
                    {filteredStatuses.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {filteredStatuses.map((item) => (
                                <div 
                                    key={item.id}
                                    className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/15 transition-all"
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div 
                                            className="w-4 h-4 rounded-full shrink-0 mt-1 border border-white/30"
                                            style={{ backgroundColor: item.bg_color || item.bgColor || '#075e54' }}
                                        />
                                        <div className="flex flex-col min-w-0">
                                            <p className="text-xs text-white font-medium leading-relaxed">
                                                "{item.text}"
                                            </p>
                                            <span className="text-[10.5px] font-mono text-[#f5efe4]/40 mt-1">
                                                Waktu: {item.scheduled_at || item.scheduledTime || 'Sekarang'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize ${
                                            item.status === 'terjadwal'
                                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                                : item.status === 'terkirim'
                                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                                        }`}>
                                            {item.status}
                                        </span>
                                        <button 
                                            onClick={() => handleDeleteStatus(item.id)}
                                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                            title="Hapus Status"
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-[#f5efe4]/40 text-xs font-sans">
                            Tidak ada jadwal status yang ditemukan pada kategori ini.
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
