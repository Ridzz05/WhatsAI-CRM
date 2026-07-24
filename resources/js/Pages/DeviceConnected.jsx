import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmModal from '@/Components/ConfirmModal';
import { 
    DeviceMobile, 
    Plus, 
    Trash, 
    QrCode, 
    WifiHigh, 
    CheckCircle, 
    Warning, 
    Buildings, 
    Phone, 
    PlugsConnected,
    Plugs
} from '@phosphor-icons/react';

export default function DeviceConnected({ devices = [], branches = [] }) {
    const [name, setName] = useState('');
    const [branchId, setBranchId] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    const [selectedQrDevice, setSelectedQrDevice] = useState(null);

    const handleCreateDevice = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        router.post(route('devices.store'), {
            name,
            branch_id: branchId || null,
        }, {
            onSuccess: () => {
                setName('');
            }
        });
    };

    const confirmDelete = (id) => {
        setSelectedDeleteId(id);
        setDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (!selectedDeleteId) return;
        router.delete(route('devices.destroy', selectedDeleteId), {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedDeleteId(null);
            }
        });
    };

    return (
        <AdminLayout activeTab="device" title="Multi-Device WhatsApp Manager">
            <Head title="Manajemen Multi-Device WhatsApp" />

            <div className="flex flex-col xl:flex-row gap-6 relative z-10 p-1">
                {/* Left Side: Create New Device Form */}
                <div className="w-full xl:w-96 shrink-0">
                    <div className="bg-[#1a1714] border border-[#ebe6dd]/10 p-6 rounded-[24px] shadow-lg sticky top-6">
                        <span className="eyebrow-badge mb-4">
                            <span className="dot"></span>Multi-Session Engine
                        </span>

                        <h2 className="font-extrabold text-xl text-white mt-4 mb-2">
                            Tambah <span className="serif-title italic text-[#e98425]">Perangkat WA</span>
                        </h2>
                        <p className="text-xs text-[#f5efe4]/50 leading-relaxed mb-6">
                            Tambahkan nomor WhatsApp / perangkat baru untuk cabang atau CS individual. Setiap perangkat berjalan independen.
                        </p>

                        <form onSubmit={handleCreateDevice} className="flex flex-col gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Nama Perangkat *" />
                                <TextInput
                                    id="name"
                                    placeholder="Contoh: WA CS Cabang PS 24 Jam"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="branch" value="Hubungkan ke Cabang UMKM" />
                                <select
                                    id="branch"
                                    className="mt-1 w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#e98425] text-white rounded-xl py-2 px-3 text-xs outline-none transition-all"
                                    value={branchId}
                                    onChange={(e) => setBranchId(e.target.value)}
                                >
                                    <option value="" className="bg-[#1a1714]">Semua Cabang (Global)</option>
                                    {branches.map((b) => (
                                        <option key={b.id} value={b.id} className="bg-[#1a1714]">{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <PrimaryButton type="submit" className="w-full justify-center">
                                + Tambah Perangkat WhatsApp
                            </PrimaryButton>
                        </form>
                    </div>
                </div>

                {/* Right Side: Devices Grid */}
                <div className="flex-1">
                    <div className="bg-[#1a1714] border border-[#ebe6dd]/10 p-6 rounded-[24px] shadow-lg">
                        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <DeviceMobile className="w-6 h-6 text-[#e98425]" />
                                    Multi-Device WhatsApp Manager ({devices.length})
                                </h3>
                                <p className="text-xs text-[#f5efe4]/50 mt-1">
                                    Daftar sesi WhatsApp terdaftar dan status keaktifan koneksi socket Baileys.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {devices.map((d) => (
                                <div 
                                    key={d.id} 
                                    className="bg-[#24201c] border border-white/5 hover:border-[#e98425]/40 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-white/5 text-[#f5efe4]/70 border border-white/10 font-mono">
                                                {d.session_id}
                                            </span>
                                            {d.status === 'connected' ? (
                                                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/30">
                                                    <PlugsConnected className="w-3.5 h-3.5" /> Online
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/50 border border-amber-800/30">
                                                    <Plugs className="w-3.5 h-3.5" /> Disconnected
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-lg font-bold text-white mb-2">
                                            {d.name}
                                        </h4>

                                        <div className="space-y-1.5 text-xs text-[#f5efe4]/70">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-[#e98425] shrink-0" />
                                                <span>{d.phone_number ? `+${d.phone_number}` : 'Nomor WA belum terhubung'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Buildings className="w-4 h-4 text-[#e98425] shrink-0" />
                                                <span>{d.branch ? d.branch.name : 'Global (Semua Cabang)'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                                        <button
                                            onClick={() => setSelectedQrDevice(d)}
                                            className="px-3 py-1.5 bg-[#e98425]/10 hover:bg-[#e98425]/20 text-[#e98425] border border-[#e98425]/30 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                                        >
                                            <QrCode className="w-4 h-4" /> Scan QR
                                        </button>

                                        <button
                                            onClick={() => confirmDelete(d.id)}
                                            className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                            title="Hapus Perangkat"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {selectedQrDevice && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1a1714] border border-[#ebe6dd]/20 p-6 rounded-[24px] max-w-sm w-full text-center space-y-4">
                        <h3 className="text-lg font-bold text-white">Scan QR Code — {selectedQrDevice.name}</h3>
                        <p className="text-xs text-[#f5efe4]/60">Buka WhatsApp di HP Anda &gt; Perangkat Tertaut &gt; Tautkan Perangkat.</p>
                        
                        <div className="bg-white p-4 rounded-2xl inline-block border border-white/20">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=SESSION_${selectedQrDevice.session_id}_WHATSAI_CRM`} 
                                alt="QR Code" 
                                className="w-48 h-48 mx-auto"
                            />
                        </div>

                        <button
                            onClick={() => setSelectedQrDevice(null)}
                            className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
                        >
                            Tutup Modal
                        </button>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={executeDelete}
                title="Hapus Perangkat WhatsApp?"
                message="Tindakan ini akan menghapus sesi perangkat dari sistem."
            />
        </AdminLayout>
    );
}
