import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    FileText, 
    Plus, 
    MagnifyingGlass, 
    WhatsappLogo, 
    Robot, 
    Trash, 
    PencilSimple, 
    Copy, 
    Check,
    X,
    Sparkle
} from '@phosphor-icons/react';

export default function Templates({ auth }) {
    const [activeTab, setActiveTab] = useState('semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Initial default templates
    const [templates, setTemplates] = useState([
        {
            id: 1,
            title: "Info Presales Loyal Fitness Prime PS",
            category: "whatsapp",
            content: "Betul kak, Loyal Fitness Prime akan hadir di Palembang Square. Konsepnya 24 jam, lokasinya di dalam mall, fasilitasnya lebih lengkap dan lebih premium dari Loyal Fitness IP. Saat ini masih masa presales, jadi harga lebih murah dibanding nanti saat sudah opening. Untuk estimasi selesai paling lama 1 Oktober 2026, tapi bisa saja lebih cepat jika persiapan selesai lebih awal.",
            updatedAt: "20 Jul 2026"
        },
        {
            id: 2,
            title: "Undangan Visit & Free Trial Gym",
            category: "whatsapp",
            content: "Halo kak! Yuk datang visit/tour langsung ke gym kami untuk lihat fasilitas lengkap (gym area, studio, sauna, locker) dan nikmati sesi latihan coba gratis (free trial). Jadwal visit bisa disesuaikan dengan waktu senggang kakak ya!",
            updatedAt: "19 Jul 2026"
        },
        {
            id: 3,
            title: "Prompt Kualifikasi Lead CS",
            category: "ai_prompt",
            content: "Fokuslah membantu menggali kebutuhan, goal fisik (turun berat badan, sehat, kelas), dan kendala calon member terlebih dahulu sebelum membicarakan penawaran closing/pendaftaran.",
            updatedAt: "18 Jul 2026"
        }
    ]);

    // Form state for new template
    const [newTitle, setNewTitle] = useState('');
    const [newCategory, setNewCategory] = useState('whatsapp');
    const [newContent, setNewContent] = useState('');

    const filteredTemplates = templates.filter(t => {
        const matchesCategory = activeTab === 'semua' || t.category === activeTab;
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              t.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleCreateTemplate = (e) => {
        e.preventDefault();
        if (!newTitle.trim() || !newContent.trim()) return;

        const newT = {
            id: Date.now(),
            title: newTitle,
            category: newCategory,
            content: newContent,
            updatedAt: "Hari ini"
        };

        setTemplates([newT, ...templates]);
        setNewTitle('');
        setNewContent('');
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm("Apakah Anda yakin ingin menghapus template pesan ini?")) {
            setTemplates(templates.filter(t => t.id !== id));
        }
    };

    const handleCopy = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <AdminLayout activeTab="templates" title="Daftar Template Pesan">
            <Head title="Template Pesan - WhatsAI CRM" />

            {/* Header Banner */}
            <div className="bg-[#1a1714] border border-[#ebe6dd]/10 p-6 rounded-[24px] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <span className="eyebrow-badge mb-3">
                        <span className="dot"></span>Message Templates Library
                    </span>
                    <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-2">
                        <FileText className="w-7 h-7 text-[#e98425]" />
                        <span>Daftar Template <span className="serif-title italic text-[#e98425]">Pesan & AI Prompts</span></span>
                    </h1>
                    <p className="text-xs text-[#f5efe4]/50 leading-relaxed mt-1">
                        Kelola template pesan broadcast & AI prompt agar pengiriman berulang menjadi lebih efisien.
                    </p>
                </div>

                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#e98425] hover:bg-[#d4741c] text-[#1a1714] text-xs font-extrabold shadow-lg shadow-[#e98425]/15 transition-all cursor-pointer"
                >
                    <Plus className="w-4 h-4" weight="bold" />
                    Template Baru
                </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                
                {/* Category Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-[#141210] border border-[#ebe6dd]/10 rounded-xl">
                    <button
                        onClick={() => setActiveTab('semua')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'semua'
                                ? 'bg-[#e98425] text-[#1a1714]'
                                : 'text-[#f5efe4]/60 hover:text-white'
                        }`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => setActiveTab('whatsapp')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'whatsapp'
                                ? 'bg-[#e98425] text-[#1a1714]'
                                : 'text-[#f5efe4]/60 hover:text-white'
                        }`}
                    >
                        <WhatsappLogo className="w-3.5 h-3.5" weight="fill" /> WhatsApp
                    </button>
                    <button
                        onClick={() => setActiveTab('ai_prompt')}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'ai_prompt'
                                ? 'bg-[#e98425] text-[#1a1714]'
                                : 'text-[#f5efe4]/60 hover:text-white'
                        }`}
                    >
                        <Robot className="w-3.5 h-3.5" weight="bold" /> AI Prompt
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 sm:max-w-xs">
                    <MagnifyingGlass className="w-4 h-4 text-[#f5efe4]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Cari template..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#141210] border border-[#ebe6dd]/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-[#f5efe4]/30 focus:outline-none focus:border-[#e98425]/50 transition-colors"
                    />
                </div>
            </div>

            {/* Template List Grid */}
            {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((t) => (
                        <div 
                            key={t.id}
                            className="bg-[#141210] border border-[#ebe6dd]/10 hover:border-[#e98425]/30 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all group"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <h3 className="font-extrabold text-sm text-white group-hover:text-[#e98425] transition-colors">
                                        {t.title}
                                    </h3>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                                        t.category === 'whatsapp' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    }`}>
                                        {t.category === 'whatsapp' ? <WhatsappLogo className="w-3 h-3" /> : <Robot className="w-3 h-3" />}
                                        {t.category === 'whatsapp' ? 'WhatsApp' : 'AI Prompt'}
                                    </span>
                                </div>
                                <p className="text-xs text-[#f5efe4]/70 leading-relaxed font-sans whitespace-pre-line bg-white/5 p-3 rounded-xl border border-white/5">
                                    "{t.content}"
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-[#ebe6dd]/10 text-xs">
                                <span className="text-[10.5px] font-mono text-[#f5efe4]/40">
                                    Diperbarui: {t.updatedAt}
                                </span>

                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleCopy(t.id, t.content)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                        title="Salin Isi Pesan"
                                    >
                                        {copiedId === t.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(t.id)}
                                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                                        title="Hapus Template"
                                    >
                                        <Trash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State UI */
                <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center my-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#f5efe4]/40 mb-4">
                        <FileText className="w-8 h-8" weight="duotone" />
                    </div>
                    <h3 className="text-base font-extrabold text-white">Belum ada template</h3>
                    <p className="text-xs text-[#f5efe4]/50 max-w-sm mt-1 mb-6">
                        Buat template baru untuk mempercepat penulisan broadcast atau balasan otomatis Anda.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e98425] hover:bg-[#d4741c] text-[#1a1714] text-xs font-bold shadow-lg transition-all"
                    >
                        <Plus className="w-4 h-4" weight="bold" />
                        Buat Template Baru
                    </button>
                </div>
            )}

            {/* Modal Create Template */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#141210] border border-[#ebe6dd]/15 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                        
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ebe6dd]/10">
                            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                                <Sparkle className="w-4 h-4 text-[#e98425]" /> Tambah Template Baru
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-white/40 hover:text-white p-1 rounded-lg"
                            >
                                <X className="w-4 h-4" weight="bold" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTemplate} className="p-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-1">
                                    Judul Template
                                </label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="Contoh: Info Presales Gym PS"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-1">
                                    Kategori
                                </label>
                                <select 
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full bg-[#1a1714] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#e98425]"
                                >
                                    <option value="whatsapp">WhatsApp Message</option>
                                    <option value="ai_prompt">AI Prompt Instruction</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-1">
                                    Isi Template Pesan
                                </label>
                                <textarea 
                                    required
                                    rows={4}
                                    placeholder="Tuliskan isi template di sini..."
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#e98425]"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ebe6dd]/10">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#f5efe4]/60 hover:text-white"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-[#e98425] hover:bg-[#d4741c] text-[#1a1714] text-xs font-extrabold shadow-lg"
                                >
                                    Simpan Template
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
