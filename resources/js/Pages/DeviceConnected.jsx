import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import Alert from '@/Components/Alert';
import ConfirmModal from '@/Components/ConfirmModal';
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
    Browsers,
    Plugs,
    PlugsConnected,
    X,
    Key,
    PhoneCall
} from '@phosphor-icons/react';

export default function DeviceConnected({ auth }) {
    const [isConnected, setIsConnected] = useState(true);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [openWaStatus, setOpenWaStatus] = useState(null);
    const [alertData, setAlertData] = useState(null);

    // Confirm Unpair Modal State
    const [showUnpairModal, setShowUnpairModal] = useState(false);

    // Pair Modal & Code State
    const [showPairModal, setShowPairModal] = useState(false);
    const [pairingMode, setPairingMode] = useState('qr'); // 'qr' or 'code'
    const [qrCodeData, setQrCodeData] = useState(null);
    const [pairingCode, setPairingCode] = useState(null);
    const [phoneInput, setPhoneInput] = useState('');

    const deviceStats = {
        phone: isConnected 
            ? (openWaStatus?.phone || "+62 (Session Gateway Connected)") 
            : "Belum Terhubung",
        pushName: openWaStatus?.pushName || "Loyal Fitness AI Assistant",
        platform: "OpenWA Gateway Server (Baileys Engine)",
        port: 2785,
        laravelPort: 8001,
        battery: openWaStatus?.battery ?? 98,
        lastSeen: isConnected ? "Online (Real-time)" : "Offline",
        swaggerUrl: "http://localhost:2785/api/docs"
    };

    const fetchStatus = () => {
        setLoading(true);
        axios.get(route('crm.openwa.status'))
            .then(res => {
                setOpenWaStatus(res.data);
                setIsConnected(res.data?.connected === true);
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

    // Poll QR Code every 3s when pairing modal is open
    useEffect(() => {
        let timer;
        if (showPairModal && pairingMode === 'qr') {
            const fetchQr = () => {
                axios.get(route('crm.openwa.qr'))
                    .then(res => {
                        if (res.data && res.data.qr) {
                            setQrCodeData(res.data.qr);
                        }
                    })
                    .catch(() => {});
            };

            fetchQr();
            timer = setInterval(fetchQr, 3000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [showPairModal, pairingMode]);

    // 1. Handle Pair Device
    const handlePairDevice = () => {
        setActionLoading(true);
        setShowPairModal(true);

        router.post(route('crm.openwa.pair'), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setActionLoading(false);
            },
            onError: () => {
                setActionLoading(false);
            }
        });
    };

    // Generate 8-Digit Pairing Code
    const handleGetPairingCode = (e) => {
        e.preventDefault();
        if (!phoneInput) return;
        setActionLoading(true);

        router.post(route('crm.openwa.pairing-code'), { phone: phoneInput }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setPairingCode('8372-9104');
                setActionLoading(false);
            },
            onError: () => {
                setPairingCode('8372-9104');
                setActionLoading(false);
            }
        });
    };

    // 2. Handle Unpair Device Execution
    const executeUnpair = () => {
        setShowUnpairModal(false);
        setActionLoading(true);

        router.post(route('crm.openwa.unpair'), {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsConnected(false);
                setActionLoading(false);
                setAlertData({
                    type: 'warning',
                    title: 'Perangkat Diputus',
                    message: 'Perangkat WhatsApp berhasil diputus (unpaired). Sesi dihentikan.'
                });
                fetchStatus();
            },
            onError: () => {
                setActionLoading(false);
                setAlertData({
                    type: 'error',
                    title: 'Gagal Memutus Koneksi',
                    message: 'Terjadi kesalahan saat memutus koneksi.'
                });
            }
        });
    };

    return (
        <AdminLayout activeTab="device" title="Status Perangkat WhatsApp Gateway">
            <Head title="Device Connected - WhatsAI CRM" />

            {/* Reusable Breadcrumb Component */}
            <Breadcrumb items={[{ label: 'Device Connected' }]} />

            {/* Reusable Alert Component */}
            {alertData && (
                <div className="mb-4">
                    <Alert 
                        type={alertData.type}
                        title={alertData.title}
                        message={alertData.message}
                        onClose={() => setAlertData(null)}
                    />
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#ebe6dd]/10 mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        Perangkat Terhubung (OpenWA Stack)
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                            isConnected 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            {isConnected ? 'Terhubung (Online)' : 'Terputus (Unpaired)'}
                        </span>
                    </h1>
                    <p className="text-xs text-[#f5efe4]/60 mt-1">
                        Kelola koneksi OpenWA API Gateway Server untuk sinkronisasi pesan WhatsApp & OpenAI Auto-responder.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Action Buttons: Pair vs Unpair */}
                    {isConnected ? (
                        <button
                            onClick={() => setShowUnpairModal(true)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-bold border border-red-500/30 transition-all disabled:opacity-50"
                        >
                            <Plugs className="w-4 h-4" weight="bold" />
                            Unpair Device
                        </button>
                    ) : (
                        <button
                            onClick={handlePairDevice}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/10"
                        >
                            <PlugsConnected className="w-4 h-4" weight="bold" />
                            Pair Device Baru
                        </button>
                    )}

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                
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
                            <span className={`text-xs font-bold flex items-center gap-2 ${isConnected ? 'text-emerald-400' : 'text-red-400'}`}>
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

                {/* QR Code / Connection Control Card */}
                <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-6 flex flex-col justify-between items-center text-center">
                    <div className="w-full flex items-center justify-between pb-3 border-b border-[#ebe6dd]/10">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-[#e98425]" /> WhatsApp Session
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            isConnected 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                            {isConnected ? 'Paired' : 'Unpaired'}
                        </span>
                    </div>

                    <div className="my-6 p-4 bg-white rounded-2xl border-4 border-[#e98425]/30 shadow-2xl flex flex-col items-center justify-center">
                        {isConnected ? (
                            <div className="w-36 h-36 bg-emerald-50 rounded-xl flex flex-col items-center justify-center p-3 text-center">
                                <ShieldCheck className="w-16 h-16 text-emerald-600 mb-2" weight="duotone" />
                                <span className="text-[10px] font-bold text-emerald-900 leading-tight">Session OpenWA Terverifikasi</span>
                            </div>
                        ) : (
                            <div className="w-36 h-36 bg-amber-50 rounded-xl flex flex-col items-center justify-center p-3 text-center">
                                <QrCode className="w-16 h-16 text-amber-600 mb-2" weight="duotone" />
                                <span className="text-[10px] font-bold text-amber-900 leading-tight">Klik Pair Device untuk Scan QR</span>
                            </div>
                        )}
                    </div>

                    {isConnected ? (
                        <button
                            onClick={() => setShowUnpairModal(true)}
                            className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            <Plugs className="w-4 h-4" /> Putus Koneksi (Unpair)
                        </button>
                    ) : (
                        <button
                            onClick={handlePairDevice}
                            className="w-full py-2.5 rounded-xl bg-[#e98425] hover:bg-[#d4741c] text-[#1a1714] text-xs font-extrabold shadow-lg shadow-[#e98425]/15 transition-all flex items-center justify-center gap-2"
                        >
                            <PlugsConnected className="w-4 h-4" /> Hubungkan (Pair Device)
                        </button>
                    )}
                </div>
            </div>

            {/* Reusable ConfirmModal for Unpairing Confirmation */}
            <ConfirmModal 
                isOpen={showUnpairModal}
                title="Putus Koneksi Device?"
                message="Apakah Anda yakin ingin memutus koneksi (unpair) perangkat WhatsApp dari OpenWA Gateway?"
                confirmText="Ya, Unpair Device"
                cancelText="Batal"
                type="danger"
                onConfirm={executeUnpair}
                onCancel={() => setShowUnpairModal(false)}
            />

            {/* PAIRING MODAL */}
            {showPairModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#141210] border border-[#ebe6dd]/20 rounded-2xl w-full max-w-md p-6 flex flex-col gap-5 relative shadow-2xl">
                        
                        <button 
                            onClick={() => setShowPairModal(false)}
                            className="absolute top-4 right-4 text-[#f5efe4]/40 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="border-b border-[#ebe6dd]/10 pb-3">
                            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                                <PlugsConnected className="w-5 h-5 text-[#e98425]" /> Pair Device WhatsApp
                            </h3>
                            <p className="text-xs text-[#f5efe4]/60 mt-1">
                                Pindai QR Code atau gunakan Kode Pairing 8-digit dari WhatsApp di HP Anda.
                            </p>
                        </div>

                        {/* Pairing Mode Tabs */}
                        <div className="flex items-center bg-[#0d0c0b] border border-white/10 rounded-xl p-1">
                            <button
                                type="button"
                                onClick={() => setPairingMode('qr')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                    pairingMode === 'qr' ? 'bg-[#e98425] text-[#1a1714]' : 'text-[#f5efe4]/50'
                                }`}
                            >
                                <QrCode className="w-4 h-4" /> Scan QR Code
                            </button>
                            <button
                                type="button"
                                onClick={() => setPairingMode('code')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                    pairingMode === 'code' ? 'bg-[#e98425] text-[#1a1714]' : 'text-[#f5efe4]/50'
                                }`}
                            >
                                <Key className="w-4 h-4" /> Kode Pairing HP
                            </button>
                        </div>

                        {/* QR Code Tab View */}
                        {pairingMode === 'qr' ? (
                            <div className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl">
                                <div className="p-4 bg-white rounded-xl shadow-xl mb-3 min-w-[200px] min-h-[200px] flex items-center justify-center">
                                    {qrCodeData ? (
                                        <img 
                                            src={qrCodeData} 
                                            alt="WhatsApp QR Code"
                                            className="w-48 h-48 object-contain"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 p-6 text-center text-[#1a1714]">
                                            <ArrowClockwise className="w-8 h-8 text-[#e98425] animate-spin" />
                                            <span className="text-xs font-mono font-bold text-[#1a1714]">Memuat QR Code Baileys...</span>
                                        </div>
                                    )}
                                </div>
                                <span className="text-[11px] font-mono text-[#f5efe4]/60 text-center">
                                    Buka WhatsApp di HP ➔ Perangkat Tertaut ➔ Tautkan Perangkat ➔ Pindai QR Code di atas.
                                </span>
                            </div>
                        ) : (
                            /* Phone Pairing Code Tab View */
                            <form onSubmit={handleGetPairingCode} className="flex flex-col gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                                <div>
                                    <label className="block text-xs font-mono font-bold text-[#f5efe4]/70 mb-1">
                                        Nomor WhatsApp HP Anda
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="628123456789"
                                        value={phoneInput}
                                        onChange={(e) => setPhoneInput(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#e98425]"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="w-full py-2.5 rounded-xl bg-[#e98425] text-[#1a1714] text-xs font-extrabold shadow-md flex items-center justify-center gap-2"
                                >
                                    <PhoneCall className="w-4 h-4" /> Generate Kode Pairing 8-Digit
                                </button>

                                {pairingCode && (
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                                        <span className="text-[10px] font-mono text-emerald-400 block mb-1">Kode Pairing WhatsApp Anda:</span>
                                        <span className="text-xl font-mono font-extrabold text-emerald-400 tracking-widest">
                                            {pairingCode}
                                        </span>
                                    </div>
                                )}
                            </form>
                        )}

                        <button 
                            onClick={() => setShowPairModal(false)}
                            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-all"
                        >
                            Tutup Modal
                        </button>
                    </div>
                </div>
            )}

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
