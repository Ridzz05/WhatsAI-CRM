import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/Card';
import { 
    ChatCircleDots, 
    User, 
    PaperPlaneRight, 
    Plus, 
    UserCheck,
    Target,
    Compass,
    Handshake,
    Sparkle
} from '@phosphor-icons/react';

export default function Dashboard() {
    // CRM states
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [stats, setStats] = useState({
        total_leads: 0,
        cold: 0,
        warm: 0,
        hot: 0,
        handovers_pending: 0,
        statuses: {}
    });
    const [users, setUsers] = useState([]);

    // Simulator states
    const [newPhone, setNewPhone] = useState('');
    const [newName, setNewName] = useState('');
    const [showNewLeadForm, setShowNewLeadForm] = useState(false);
    const [typedMessage, setTypedMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);

    // Chat scroll reference
    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchStats();
        fetchLeads();
        fetchUsers();

        // Poll stats/gateway status every 10 seconds to keep UI responsive
        const interval = setInterval(() => {
            fetchStats();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Auto scroll to bottom when conversation history changes
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversations]);

    const fetchStats = async () => {
        try {
            const res = await fetch(route('crm.stats'));
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.error("Gagal memuat stats:", err);
        }
    };

    const fetchLeads = async () => {
        try {
            const res = await fetch(route('crm.leads'));
            const data = await res.json();
            setLeads(data.leads);
            
            // Re-sync selected lead if active
            if (selectedLead) {
                const updated = data.leads.find(l => l.id === selectedLead.id);
                if (updated) setSelectedLead(updated);
            }
        } catch (err) {
            console.error("Gagal memuat leads:", err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(route('crm.users'));
            const data = await res.json();
            setUsers(data.users);
        } catch (err) {
            console.error("Gagal memuat user CS:", err);
        }
    };

    const selectLead = async (lead) => {
        setSelectedLead(lead);
        setLoadingChat(true);
        try {
            const res = await fetch(route('crm.leads.chat', lead.id));
            const data = await res.json();
            setConversations(data.conversations);
        } catch (err) {
            console.error("Gagal memuat chat:", err);
        } finally {
            setLoadingChat(false);
        }
    };

    const handleCreateSimulatedLead = async (e) => {
        e.preventDefault();
        if (!newPhone.trim()) return;

        setSending(true);
        try {
            const response = await fetch(route('crm.whatsapp.simulate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    phone: newPhone,
                    name: newName || 'Calon Member Baru',
                    message: 'Halo, saya mau tanya-tanya info gym Loyal Fitness dong.'
                })
            });
            const data = await response.json();
            if (data.success) {
                setNewPhone('');
                setNewName('');
                setShowNewLeadForm(false);
                await fetchLeads();
                await fetchStats();
                // Select newly created lead
                const created = data.lead;
                setSelectedLead(created);
                setConversations(data.conversations);
            }
        } catch (err) {
            console.error("Gagal membuat nomor simulasi:", err);
        } finally {
            setSending(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!typedMessage.trim() || !selectedLead || sending) return;

        const userMsg = typedMessage;
        setTypedMessage('');
        setSending(true);

        // Optimistically add user message to list
        const tempMsg = { id: Date.now(), sender: 'user', message: userMsg, created_at: new Date().toISOString() };
        setConversations(prev => [...prev, tempMsg]);

        try {
            const response = await fetch(route('crm.whatsapp.simulate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    phone: selectedLead.phone,
                    name: selectedLead.name,
                    message: userMsg
                })
            });
            const data = await response.json();
            if (data.success) {
                setConversations(data.conversations);
                fetchLeads();
                fetchStats();
            }
        } catch (err) {
            console.error("Gagal mengirim pesan:", err);
        } finally {
            setSending(false);
        }
    };

    const handleAssignCS = async (userId) => {
        if (!selectedLead) return;
        try {
            const response = await fetch(route('crm.leads.assign', selectedLead.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ assigned_to: userId ? parseInt(userId) : null })
            });
            const data = await response.json();
            if (data.success) {
                fetchLeads();
            }
        } catch (err) {
            console.error("Gagal menetapkan CS:", err);
        }
    };

    const handleUpdateStatus = async (status) => {
        if (!selectedLead) return;
        try {
            const response = await fetch(route('crm.leads.status', selectedLead.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status })
            });
            const data = await response.json();
            if (data.success) {
                fetchLeads();
                fetchStats();
            }
        } catch (err) {
            console.error("Gagal memperbarui status:", err);
        }
    };

    const formatRp = (val) => {
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(val);
    };

    // Lead Status options for CS follow up
    const leadStatuses = [
        'New Lead', 'Cold', 'Warm', 'Hot', 'Handover to CS', 'Visit Scheduled', 'Closed Won', 'Closed Lost'
    ];

    return (
        <AdminLayout activeTab="dashboard" title="CRM & WhatsApp AI Simulator">
            <Head title="CRM Dashboard" />

            {/* WhatsApp Gateway Connection Status Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#1a1714] border border-[#ebe6dd]/10 p-5 rounded-[24px] relative z-10 gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-[#e98425]">
                        <ChatCircleDots className="w-5 h-5" weight="bold" />
                    </div>
                    <div>
                        <span className="text-[9px] font-bold font-mono text-[#f5efe4]/40 uppercase tracking-widest block leading-none mb-1">WhatsApp Engine Status</span>
                        <h4 className="font-extrabold text-sm text-white">Self-Hosted Baileys Gateway</h4>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold font-mono tracking-wide uppercase ${
                        stats.gateway_status === 'connected'
                            ? 'bg-[#d2eecb]/10 border border-[#d2eecb]/20 text-[#6cba5b]'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stats.gateway_status === 'connected' ? 'bg-[#6cba5b] animate-pulse' : 'bg-red-400'}`} />
                        {stats.gateway_status === 'connected' ? 'TERHUBUNG (ONLINE)' : 'TERPUTUS (OFFLINE)'}
                    </span>
                </div>
            </div>

            {/* WhatsApp Gateway Connection QR Code Card */}
            {stats.gateway_status !== 'connected' && stats.gateway_qr && (
                <div className="flex flex-col md:flex-row items-center justify-between bg-[#1f1a16]/90 border border-[#e98425]/30 p-6 rounded-[24px] relative z-10 gap-6 backdrop-blur-md">
                    <div className="flex-1">
                        <span className="text-[10px] font-bold font-mono text-[#e98425] uppercase tracking-widest block mb-2">WhatsApp Connection Required</span>
                        <h3 className="font-extrabold text-lg text-white mb-2">Tautkan Akun WhatsApp</h3>
                        <p className="text-xs text-[#f5efe4]/60 leading-relaxed max-w-xl">
                            WhatsApp Gateway saat ini terputus. Silakan scan QR code di samping menggunakan aplikasi WhatsApp HP Anda (masuk ke menu <b>Perangkat Tertaut</b> / <b>Linked Devices</b>) untuk mengaktifkan kembali auto-reply bot dan sinkronisasi otomatis dasbor.
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-2xl border-4 border-[#e98425]/40 shadow-2xl">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(stats.gateway_qr)}`} 
                            alt="WhatsApp Gateway QR Code"
                            className="w-[160px] h-[160px] select-none rounded-lg"
                        />
                        <span className="text-[9px] font-bold font-mono text-gray-500 uppercase tracking-wider mt-1">Scan Link Device</span>
                    </div>
                </div>
            )}

            {/* Top KPI stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative z-10">
                <Card title="Total Leads" subtitle={`${stats.total_leads} Orang`} color="dark">
                    <span className="text-[10px] font-mono text-[#f5efe4]/40 mt-1 block">Seluruh nomor masuk</span>
                </Card>
                <Card title="Cold Leads (Score 0-40)" subtitle={`${stats.cold} Orang`} color="blue">
                    <span className="text-[10px] font-mono text-[#1a1714]/50 mt-1 block">Baru tanya-tanya info</span>
                </Card>
                <Card title="Warm Leads (Score 41-69)" subtitle={`${stats.warm} Orang`} color="yellow">
                    <span className="text-[10px] font-mono text-[#1a1714]/50 mt-1 block">Tertarik promo & fasilitas</span>
                </Card>
                <Card title="Hot / Handover (Score >=70)" subtitle={`${stats.hot} Orang`} color="peach">
                    <span className="text-[10px] font-mono text-[#1a1714]/50 mt-1 block">Siap daftar / jadwalkan visit</span>
                </Card>
            </div>

            {/* Main CRM Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10 min-h-[580px]">
                
                {/* 1. LEFT SIDEBAR: Leads List (Col 3) */}
                <div className="xl:col-span-3 flex flex-col gap-4">
                    <div className="bg-[#1a1714] border border-[#ebe6dd]/10 rounded-[24px] p-5 flex-1 flex flex-col justify-between max-h-[580px] overflow-hidden">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-bold text-white uppercase tracking-wider">Leads Chat</span>
                                <button
                                    onClick={() => setShowNewLeadForm(!showNewLeadForm)}
                                    className="p-1 text-[#e98425] hover:bg-white/5 rounded-lg border border-[#e98425]/20 flex items-center justify-center transition-all cursor-pointer"
                                    title="Tambah Simulasi Nomor Baru"
                                >
                                    <Plus className="w-4 h-4" weight="bold" />
                                </button>
                            </div>

                            {/* Simulated New Lead Form */}
                            {showNewLeadForm && (
                                <form onSubmit={handleCreateSimulatedLead} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-3 mb-4 animate-in slide-in-from-top-4 duration-200">
                                    <div>
                                        <label className="text-[9px] font-mono uppercase tracking-widest text-[#f5efe4]/40 block mb-1">Nomor WA</label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: 62812345678" 
                                            value={newPhone}
                                            onChange={(e) => setNewPhone(e.target.value)}
                                            className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-1.5 px-3 rounded-lg text-white font-mono focus:border-[#e98425] outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-mono uppercase tracking-widest text-[#f5efe4]/40 block mb-1">Nama Calon Member</label>
                                        <input 
                                            type="text" 
                                            placeholder="Contoh: Budi Pratama" 
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-1.5 px-3 rounded-lg text-white focus:border-[#e98425] outline-none"
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={sending}
                                        className="w-full py-1.5 bg-[#e98425] hover:scale-[1.02] text-[#1a1714] font-bold text-[10px] rounded-lg tracking-wider font-mono uppercase transition-all"
                                    >
                                        Mulai Chat
                                    </button>
                                </form>
                            )}

                            {/* Leads List Scrollable */}
                            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[380px] pr-1.5 scrollbar-thin">
                                {leads.map((lead) => {
                                    const isSelected = selectedLead?.id === lead.id;
                                    return (
                                        <div
                                            key={lead.id}
                                            onClick={() => selectLead(lead)}
                                            className={`p-3 rounded-xl cursor-pointer border transition-all flex flex-col gap-2 ${
                                                isSelected 
                                                    ? 'bg-[#e98425]/15 border-[#e98425]/30 text-white'
                                                    : 'bg-white/5 border-transparent text-[#f5efe4]/70 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="min-w-0">
                                                    <span className="font-bold text-xs block truncate">{lead.name || 'Calon Member'}</span>
                                                    <span className="text-[10px] font-mono text-[#f5efe4]/40 block truncate mt-0.5">{lead.phone}</span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-bold tracking-wider ${
                                                    lead.lead_score >= 70
                                                        ? 'bg-[#ffe1d9] text-[#ff7a52]'
                                                        : lead.lead_score >= 41
                                                        ? 'bg-[#ffe9bf] text-[#f0b54a]'
                                                        : 'bg-[#d6e7ff] text-[#4a86e9]'
                                                }`}>
                                                    {lead.lead_score}%
                                                </span>
                                            </div>

                                            {/* Status Badge & assigned */}
                                            <div className="flex justify-between items-center text-[9px] font-mono mt-1 border-t border-white/5 pt-2">
                                                <span className="text-[#f5efe4]/30">{lead.status}</span>
                                                <span className="text-[#e98425] truncate max-w-[80px]">
                                                    {lead.assigned_user ? `@${lead.assigned_user.name.split(' ')[0]}` : 'unassigned'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {leads.length === 0 && (
                                    <div className="py-12 text-center text-xs text-[#f5efe4]/30 font-semibold italic">
                                        Belum ada data leads. Klik tombol + diatas untuk membuat simulasi chat.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. MIDDLE WORKSPACE: WhatsApp Chat Simulator Mockup (Col 6) */}
                <div className="xl:col-span-6">
                    <div className="bg-[#1a1714] border border-[#ebe6dd]/10 rounded-[24px] h-[580px] flex flex-col justify-between overflow-hidden relative">
                        
                        {selectedLead ? (
                            <>
                                {/* Simulated WhatsApp Header */}
                                <div className="bg-[#1a1714] border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#e98425]/15 border border-[#e98425]/20 flex items-center justify-center text-[#e98425]">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xs text-white leading-tight">{selectedLead.name}</h3>
                                            <span className="text-[10px] font-mono text-[#6cba5b] block mt-0.5">Online • AI Assistant Aktif</span>
                                        </div>
                                    </div>
                                    
                                    {/* Action info */}
                                    <span className="text-[10px] font-mono text-[#f5efe4]/30 bg-white/5 px-2.5 py-1 rounded-md">
                                        WhatsApp Webhook Simulator
                                    </span>
                                </div>

                                {/* Chat Message Thread Area */}
                                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin bg-[#0e0d0c]/30">
                                    {loadingChat ? (
                                        <div className="my-auto text-center text-xs font-mono text-[#f5efe4]/30">
                                            Memuat riwayat obrolan...
                                        </div>
                                    ) : (
                                        <>
                                            {/* Shift notification or welcome */}
                                            <div className="text-center">
                                                <span className="bg-white/5 text-[#f5efe4]/40 font-mono text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                    Chat Terbuka · {new Date(selectedLead.created_at).toLocaleDateString('id-ID')}
                                                </span>
                                            </div>

                                            {conversations.map((chat) => {
                                                const isUser = chat.sender === 'user';
                                                return (
                                                    <div 
                                                        key={chat.id} 
                                                        className={`flex flex-col max-w-[80%] ${
                                                            isUser ? 'align-self-end items-end ml-auto' : 'align-self-start items-start mr-auto'
                                                        }`}
                                                    >
                                                        {/* Sender identity */}
                                                        <span className="text-[9px] font-mono text-[#f5efe4]/30 mb-1 px-1">
                                                            {isUser ? (selectedLead.name || 'Member') : (chat.sender === 'ai' ? 'AI Bot' : 'CS Agent')}
                                                        </span>
                                                        
                                                        {/* Text Bubble */}
                                                        <div className={`p-3.5 rounded-[18px] text-xs leading-relaxed ${
                                                            isUser 
                                                                ? 'bg-[#e98425] text-[#1a1714] font-semibold rounded-tr-none' 
                                                                : 'bg-[#2b251f] text-[#f5efe4] rounded-tl-none border border-white/5'
                                                        }`}>
                                                            {chat.message}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={chatEndRef} />
                                        </>
                                    )}
                                </div>

                                {/* Simulated input field form */}
                                <form onSubmit={handleSendMessage} className="p-4 bg-[#1a1714] border-t border-white/5 flex gap-2 shrink-0">
                                    <input 
                                        type="text"
                                        placeholder="Ketik pesan WhatsApp disini..."
                                        value={typedMessage}
                                        onChange={(e) => setTypedMessage(e.target.value)}
                                        className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#e98425] focus:outline-none rounded-xl py-3 px-4 text-xs text-white"
                                        disabled={sending}
                                        required
                                    />
                                    <button 
                                        type="submit"
                                        disabled={sending || !typedMessage.trim()}
                                        className="w-12 bg-[#e98425] text-[#1a1714] rounded-xl flex items-center justify-center hover:scale-[1.02] active:scale-[0.97] transition-all cursor-pointer disabled:opacity-40"
                                    >
                                        <PaperPlaneRight className="w-5 h-5" weight="bold" />
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="m-auto text-center max-w-xs flex flex-col items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-[#f5efe4]/30">
                                    <ChatCircleDots className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-white text-sm">Tidak Ada Obrolan Aktif</h3>
                                <p className="text-xs text-[#f5efe4]/40 leading-relaxed">
                                    Pilih salah satu calon member di sebelah kiri untuk menguji simulasi chatbot WhatsApp AI, atau klik ikon tambah (+) untuk mendaftarkan nomor simulasi baru.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. RIGHT PANEL: Leads Details & Action Panel (Col 3) */}
                <div className="xl:col-span-3">
                    <div className="bg-[#1a1714] border border-[#ebe6dd]/10 rounded-[24px] p-5 h-[580px] flex flex-col justify-between overflow-y-auto scrollbar-none">
                        
                        {selectedLead ? (
                            <div className="flex flex-col gap-6">
                                <div>
                                    <span className="eyebrow-badge mb-3">
                                        <span className="dot"></span>Lead Profile
                                    </span>
                                    <h3 className="font-bold text-white text-base mt-2 truncate">{selectedLead.name}</h3>
                                    <span className="text-xs text-[#e98425] font-mono block mt-0.5">{selectedLead.phone}</span>
                                </div>

                                {/* AI Extraction parameters card */}
                                <div className="flex flex-col gap-3">
                                    <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 border-b border-white/5 pb-1 block">
                                        Kualifikasi AI (Lead Qualification)
                                    </span>
                                    
                                    {/* Goal parameter */}
                                    <div className="flex items-center gap-2 text-xs">
                                        <Target className="w-4 h-4 text-[#e98425] shrink-0" />
                                        <div>
                                            <span className="text-[10px] text-[#f5efe4]/40 block leading-tight">Target Fitnes</span>
                                            <span className="font-semibold text-white mt-0.5 block">
                                                {selectedLead.goal || 'Belum diidentifikasi'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Interest parameter */}
                                    <div className="flex items-center gap-2 text-xs mt-1">
                                        <Sparkle className="w-4 h-4 text-[#ffe9bf] shrink-0" />
                                        <div>
                                            <span className="text-[10px] text-[#f5efe4]/40 block leading-tight">Minat Layanan</span>
                                            <span className="font-semibold text-white mt-0.5 block">
                                                {selectedLead.interest || 'Belum diidentifikasi'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Location parameter */}
                                    <div className="flex items-center gap-2 text-xs mt-1">
                                        <Compass className="w-4 h-4 text-[#d2eecb] shrink-0" />
                                        <div>
                                            <span className="text-[10px] text-[#f5efe4]/40 block leading-tight">Domisili</span>
                                            <span className="font-semibold text-white mt-0.5 block">
                                                {selectedLead.location || 'Belum diidentifikasi'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Assigned to CS selection */}
                                <div>
                                    <label className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 mb-1.5 block">
                                        Tugaskan Ke Agent CS
                                    </label>
                                    <select
                                        value={selectedLead.assigned_to || ''}
                                        onChange={(e) => handleAssignCS(e.target.value)}
                                        className="w-full bg-[#0e0d0c] border border-white/10 hover:border-white/20 focus:border-[#e98425] focus:outline-none rounded-xl text-xs py-2 px-3 text-white font-mono"
                                    >
                                        <option value="">Belum Ditugaskan</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Manual follow up status update */}
                                <div>
                                    <label className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 mb-1.5 block">
                                        Status Follow-Up CRM
                                    </label>
                                    <select
                                        value={selectedLead.status}
                                        onChange={(e) => handleUpdateStatus(e.target.value)}
                                        className="w-full bg-[#0e0d0c] border border-white/10 hover:border-white/20 focus:border-[#e98425] focus:outline-none rounded-xl text-xs py-2 px-3 text-white font-mono"
                                    >
                                        {leadStatuses.map((st) => (
                                            <option key={st} value={st}>
                                                {st}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Handover summary notifications */}
                                {selectedLead.status === 'Handover to CS' && (
                                    <div className="bg-[#ff6b3d]/10 border border-[#ff6b3d]/20 rounded-2xl p-4 text-xs flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-[#ff6b3d] font-bold font-mono text-[9px] uppercase tracking-wider">
                                            <Handshake className="w-4 h-4" /> Notifikasi Handover
                                        </div>
                                        <p className="text-[#f5efe4]/80 leading-relaxed text-[11px] font-medium bg-[#0e0d0c]/30 p-2.5 rounded-lg border border-white/5">
                                            AI merekomendasikan penutupan manual oleh CS: Calon member terdeteksi siap melakukan registrasi atau menginginkan jadwal kunjungan langsung.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="my-auto text-center text-xs text-[#f5efe4]/30 font-semibold italic">
                                Pilih leads untuk memodifikasi parameter CRM.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
