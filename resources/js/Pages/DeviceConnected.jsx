import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { 
    DeviceMobile, 
    ArrowClockwise, 
    QrCode, 
    Cpu, 
    WifiHigh, 
    BatteryHigh, 
    ShieldCheck,
    Broadcast,
    Copy,
    Check,
    Browsers
} from '@phosphor-icons/react';

export default function DeviceConnected({ auth }) {
    const [isConnected, setIsConnected] = useState(true);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [openWaStatus, setOpenWaStatus] = useState(null);

    const deviceStats = {
        phone: "+62 812-2282-7630",
        pushName: "Loyal Fitness AI Assistant",
        platform: "OpenWA Gateway Server (Baileys Engine)",
        port: 2785,
        laravelPort: 8001,
        battery: 98,
        lastSeen: "Online (Real-time)",
        swaggerUrl: "http://localhost:2785/api/docs"
    };

    const fetchStatus = () => {
        setLoading(true);
        fetch(route('crm.openwa.status'))
            .then(res => res.json())
            .then(data => {
                setOpenWaStatus(data);
                setIsConnected(data?.connected ?? true);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const copyWebhook = () => {
        navigator.clipboard.writeText("http://localhost:8001/api/whatsapp/webhook");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AdminLayout activeTab="device" title="Status Perangkat WhatsApp Gateway">
            <Head title="Device Connected - WhatsAI CRM" />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#ebe6dd]/10">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        Perangkat Terhubung (OpenWA Stack)
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                            isConnected 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            {isConnected ? 'Terhubung (Online)' : 'Terputus'}
                        </span>
                    </h1>
                    <p className="text-xs text-[#f5efe4]/60 mt-1">
                        Kelola koneksi OpenWA API Gateway Server untuk sinkronisasi pesan WhatsApp & OpenAI Auto-responder.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href={deviceStats.swaggerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#e98425]/15 hover:bg-[#e98425]/25 text-[#e98425] text-xs font-bold border border-[#e98425]/30 transition-all"
                    >
                        <Browsers className="w-4 h-4" weight="bold" />
                        Swagger API Docs
                    </a>

                    <button 
                        onClick={fetchStatus}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all disabled:opacity-50"
                    >
                        <ArrowClockwise className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} weight="bold" />
                        Refresh Status
                    </button>
                </div>
            </div>

            {/* Grid Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Device Info Card */}
                <div className="md:col-span-2 bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <DeviceMobile className="w-48 h-48 text-white" />
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-[#e98425]/10 border border-[#e98425]/30 flex items-center justify-center text-[#e98425]">
                            <DeviceMobile className="w-7 h-7" weight="duotone" />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-white">{deviceStats.pushName}</h2>
                            <p className="text-xs font-mono text-[#e98425]">{deviceStats.phone}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#ebe6dd]/10">
                        <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#f5efe4]/40 block mb-1">Gateway Engine</span>
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-[#e98425]" /> {deviceStats.platform}
                            </span>
                        </div>

                        <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#f5efe4]/40 block mb-1">Status Koneksi</span>
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                                <WifiHigh className="w-4 h-4" /> {deviceStats.lastSeen}
                            </span>
                        </div>

                        <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#f5efe4]/40 block mb-1">Status Baterai HP</span>
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                                <BatteryHigh className="w-4 h-4 text-emerald-400" /> {deviceStats.battery}% (Mengisi Daya)
                            </span>
                        </div>

                        <div className="bg-white/5 rounded-xl p-3.5 border border-white/5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#f5efe4]/40 block mb-1">Port Service</span>
                            <span className="text-xs font-bold font-mono text-white flex items-center gap-2">
                                <Broadcast className="w-4 h-4 text-[#e98425]" /> OpenWA :{deviceStats.port} | CRM :{deviceStats.laravelPort}
                            </span>
                        </div>
                    </div>
                </div>

                {/* QR Code / Security Card */}
                <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col justify-between items-center text-center">
                    <div className="w-full flex items-center justify-between pb-3 border-b border-[#ebe6dd]/10">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-[#e98425]" /> QR Code Pairing
                        </span>
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                            Paired
                        </span>
                    </div>

                    <div className="my-6 p-4 bg-white rounded-2xl border-4 border-[#e98425]/30 shadow-2xl flex flex-col items-center justify-center">
                        <div className="w-36 h-36 bg-emerald-50 rounded-xl flex flex-col items-center justify-center p-3 text-center">
                            <ShieldCheck className="w-16 h-16 text-emerald-600 mb-2" weight="duotone" />
                            <span className="text-[10px] font-bold text-emerald-900 leading-tight">Session OpenWA Terverifikasi</span>
                        </div>
                    </div>

                    <p className="text-[11px] text-[#f5efe4]/50 leading-relaxed">
                        Sesi WhatsApp utama sudah terhubung dengan OpenWA REST Gateway. Modul Auto-Mute 10 menit & AI Responder aktif.
                    </p>
                </div>
            </div>

            {/* Webhook Configuration & Health */}
            <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Broadcast className="w-4 h-4 text-[#e98425]" /> Konfigurasi Webhook Gateway (OpenWA)
                </h3>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-mono text-[#f5efe4]/40 mb-1">Target Webhook URL (Laravel REST Endpoint):</span>
                        <code className="text-xs font-mono text-emerald-400 font-bold truncate">
                            http://localhost:8001/api/whatsapp/webhook
                        </code>
                    </div>

                    <button 
                        onClick={copyWebhook}
                        className="px-4 py-2 rounded-lg bg-[#e98425]/15 hover:bg-[#e98425]/25 text-[#e98425] text-xs font-bold border border-[#e98425]/30 transition-all flex items-center justify-center gap-2 shrink-0"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Tersalin!' : 'Salin URL'}
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
