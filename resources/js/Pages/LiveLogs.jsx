import { useState, useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import Alert from '@/Components/Alert';
import ConfirmModal from '@/Components/ConfirmModal';
import { 
    TerminalWindow, 
    Play, 
    Pause, 
    Trash, 
    Funnel, 
    ArrowClockwise,
    Broadcast,
    Robot,
    ShieldSlash,
    WarningCircle,
    CheckCircle
} from '@phosphor-icons/react';

export default function LiveLogs() {
    const [logs, setLogs] = useState([]);
    const [isStreaming, setIsStreaming] = useState(true);
    const [autoScroll, setAutoScroll] = useState(true);
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [alertMessage, setAlertMessage] = useState(null);
    const [showClearModal, setShowClearModal] = useState(false);
    const consoleEndRef = useRef(null);

    const fetchLogs = async () => {
        try {
            const response = await axios.get(route('api.logs.stream'));
            if (response.data?.logs) {
                setLogs(response.data.logs);
            }
        } catch (error) {
            console.error("Error fetching live logs:", error);
        }
    };

    useEffect(() => {
        fetchLogs();
        let interval = null;
        if (isStreaming) {
            interval = setInterval(() => {
                fetchLogs();
            }, 2000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isStreaming]);

    useEffect(() => {
        if (autoScroll && consoleEndRef.current) {
            consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, autoScroll]);

    const handleClearLogs = async () => {
        try {
            await axios.post(route('api.logs.clear'));
            setLogs([]);
            setShowClearModal(false);
            setAlertMessage({ type: 'success', title: 'BERHASIL', message: 'Terminal console log berhasil dibersihkan.' });
        } catch (error) {
            setAlertMessage({ type: 'error', title: 'GAGAL', message: 'Gagal membersihkan log: ' + error.message });
        }
    };

    const filteredLogs = logs.filter(log => {
        if (filterCategory === 'ALL') return true;
        return log.category === filterCategory;
    });

    const getCategoryBadge = (category) => {
        switch (category) {
            case 'WEBHOOK':
                return {
                    label: '📨 WEBHOOK',
                    bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                };
            case 'AI_REPLY':
                return {
                    label: '🤖 AI REPLY',
                    bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                };
            case 'CS_MUTE':
                return {
                    label: '🛑 CS MUTE',
                    bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                };
            case 'ERROR':
                return {
                    label: '❌ ERROR',
                    bg: 'bg-red-500/10 border-red-500/20 text-red-400'
                };
            default:
                return {
                    label: '⚙️ SYSTEM',
                    bg: 'bg-white/5 border-white/10 text-white/60'
                };
        }
    };

    return (
        <AdminLayout activeTab="live-logs" title="Live System Logs - WhatsAI CRM">
            <Head title="Live Terminal Logs (Real-Time)" />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header & Breadcrumb */}
                <div>
                    <Breadcrumb items={[{ label: 'Live System Logs' }]} />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                                <TerminalWindow className="w-6 h-6 sm:w-7 sm:h-7 text-[#e98425]" />
                                <span>Live Terminal Logs Console</span>
                            </h1>
                            <p className="text-xs text-[#f5efe4]/60 mt-1">
                                Pantau aliran log pesan masuk, respon AI, error, dan penahanan CS Mute secara real-time langsung di browser.
                            </p>
                        </div>

                        {/* Top Action Bar */}
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <button
                                onClick={() => setIsStreaming(!isStreaming)}
                                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                                    isStreaming 
                                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                }`}
                            >
                                {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                <span>{isStreaming ? 'Pause' : 'Live'}</span>
                            </button>

                            <button
                                onClick={() => fetchLogs()}
                                className="p-2.5 bg-[#1a1714] border border-[#ebe6dd]/10 hover:bg-white/5 text-[#f5efe4] rounded-xl text-xs font-mono transition-all cursor-pointer"
                                title="Refresh Manual"
                            >
                                <ArrowClockwise className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setShowClearModal(true)}
                                className="px-3 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                                <Trash className="w-4 h-4" />
                                <span>Clear</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Alert Notification */}
                {alertMessage && (
                    <Alert 
                        type={alertMessage.type}
                        title={alertMessage.title}
                        message={alertMessage.message}
                        onClose={() => setAlertMessage(null)}
                    />
                )}

                {/* Filters & Controls Header */}
                <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                        <Funnel className="w-4 h-4 text-[#e98425] shrink-0" />
                        <span className="text-xs font-mono text-[#f5efe4]/50 mr-1">Filter:</span>

                        {[
                            { id: 'ALL', label: 'Semua Log' },
                            { id: 'WEBHOOK', label: '📨 Webhook' },
                            { id: 'AI_REPLY', label: '🤖 AI Reply' },
                            { id: 'CS_MUTE', label: '🛑 CS Mute' },
                            { id: 'ERROR', label: '❌ Error' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setFilterCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                    filterCategory === cat.id
                                        ? 'bg-[#e98425] text-black font-bold shadow-md'
                                        : 'bg-[#1a1714] border border-[#ebe6dd]/10 text-[#f5efe4]/70 hover:text-white'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Auto-Scroll Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[#f5efe4]/70 hover:text-white transition-colors">
                        <input 
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="rounded bg-[#1a1714] border-[#ebe6dd]/20 text-[#e98425] focus:ring-0 cursor-pointer"
                        />
                        <span>Auto-Scroll ke Bawah</span>
                    </label>
                </div>

                {/* Cyberpunk Terminal Console Screen */}
                <div className="bg-[#0a0a0c] border border-[#ebe6dd]/15 rounded-2xl p-3 sm:p-5 shadow-2xl relative font-mono text-xs overflow-hidden">
                    
                    {/* Terminal Header Bar */}
                    <div className="flex items-center justify-between border-b border-[#ebe6dd]/10 pb-3 mb-4 text-[#f5efe4]/40 text-[11px] flex-wrap gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="w-3 h-3 rounded-full bg-red-500/80 shrink-0" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shrink-0" />
                            <div className="w-3 h-3 rounded-full bg-green-500/80 shrink-0" />
                            <span className="ml-1 font-bold text-white/70 truncate max-w-[180px] sm:max-w-none">whatsai-crm@terminal:~/storage/logs/laravel.log</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-emerald-400 font-bold">{isStreaming ? 'STREAMING LIVE (2s)' : 'PAUSED'}</span>
                        </div>
                    </div>

                    {/* Console Lines Stream View */}
                    <div className="space-y-2 max-h-[clamp(350px,50vh,520px)] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log, index) => {
                                const badge = getCategoryBadge(log.category);
                                return (
                                    <div 
                                        key={index}
                                        className="p-3 rounded-xl bg-[#141210]/90 border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row md:items-start gap-3"
                                    >
                                        {/* Timestamp & Level */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            {log.timestamp && (
                                                <span className="text-[#f5efe4]/40 text-[11px]">
                                                    [{log.timestamp}]
                                                </span>
                                            )}
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${badge.bg}`}>
                                                {badge.label}
                                            </span>
                                        </div>

                                        {/* Log Body */}
                                        <div className="flex-1 text-[#f5efe4]/90 break-words leading-relaxed whitespace-pre-wrap">
                                            {log.message}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-20 text-center text-[#f5efe4]/30 font-mono">
                                ⚡ Belum ada baris log yang cocok dengan filter. Terminal console siap menerima event...
                            </div>
                        )}
                        <div ref={consoleEndRef} />
                    </div>
                </div>

            </div>

            {/* Clear Log Confirmation Modal */}
            <ConfirmModal 
                isOpen={showClearModal}
                title="Bersihkan Terminal Console"
                message="Apakah Anda yakin ingin menghapus seluruh berkas log laravel.log dari server?"
                confirmText="Hapus Log"
                type="danger"
                onConfirm={handleClearLogs}
                onCancel={() => setShowClearModal(false)}
            />
        </AdminLayout>
    );
}
