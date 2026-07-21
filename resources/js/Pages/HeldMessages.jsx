import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Breadcrumb from '@/Components/Breadcrumb';
import Alert from '@/Components/Alert';
import ConfirmModal from '@/Components/ConfirmModal';
import { 
    ShieldSlash, 
    MagnifyingGlass, 
    ArrowClockwise, 
    Trash, 
    Clock, 
    CheckCircle, 
    ChatCircleDots,
    UserCheck,
    WhatsappLogo
} from '@phosphor-icons/react';

export default function HeldMessages({ logs, filters = {}, stats = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'restore'|'delete', id: null, title: '', message: '' }

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('crm.held-messages'), { search }, { preserveState: true });
    };

    const handleResetSearch = () => {
        setSearch('');
        router.get(route('crm.held-messages'), {}, { preserveState: true });
    };

    const triggerRestoreModal = (log) => {
        setConfirmAction({
            type: 'restore',
            id: log.id,
            title: 'Aktifkan Kembali AI Auto-Reply',
            message: `Apakah Anda yakin ingin membatalkan status Mute CS dan mengembalikan balasan otomatis AI untuk nomor +${log.phone} (${log.customer_name || 'Calon Member'})?`,
            confirmText: 'Restore AI',
            confirmType: 'success'
        });
    };

    const triggerDeleteModal = (id) => {
        setConfirmAction({
            type: 'delete',
            id: id,
            title: 'Hapus Entri Log',
            message: 'Apakah Anda yakin ingin menghapus catatan log pesan ditahan ini?',
            confirmText: 'Hapus Log',
            confirmType: 'danger'
        });
    };

    const executeConfirmAction = () => {
        if (!confirmAction) return;

        if (confirmAction.type === 'restore') {
            router.post(route('crm.held-messages.restore', confirmAction.id), {}, {
                onSuccess: () => setConfirmAction(null)
            });
        } else if (confirmAction.type === 'delete') {
            router.delete(route('crm.held-messages.destroy', confirmAction.id), {
                onSuccess: () => setConfirmAction(null)
            });
        }
    };

    return (
        <AdminLayout activeTab="held-messages" title="Log Pesan Ditahan - WhatsAI CRM">
            <Head title="Log Pesan Ditahan (CS Mute)" />

            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                
                {/* Header & Breadcrumb */}
                <div>
                    <Breadcrumb items={[{ label: 'Log Pesan Ditahan' }]} />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                                <ShieldSlash className="w-6 h-6 sm:w-7 sm:h-7 text-[#e98425]" />
                                <span>Log Pesan Ditahan (CS Mute)</span>
                            </h1>
                            <p className="text-xs text-[#f5efe4]/60 mt-1">
                                Pantau seluruh pesan pelanggan yang ditahan dari balasan AI otomatis akibat balasan manual HP CS atau status Handover.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Flash Alert Notification */}
                {flash?.success && (
                    <Alert 
                        type="success" 
                        title="BERHASIL" 
                        message={flash.success} 
                    />
                )}

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
                        <div>
                            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#f5efe4]/50">Total Pesan Ditahan</p>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1">{stats.total_held || 0} Pesan</h3>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#e98425]/10 border border-[#e98425]/20 flex items-center justify-center text-[#e98425]">
                            <ShieldSlash className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>

                    <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
                        <div>
                            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#f5efe4]/50">Mute 30-Menit Aktif</p>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-amber-400 mt-1">{stats.active_cache_mutes || 0} Nomor</h3>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>

                    <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-lg">
                        <div>
                            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#f5efe4]/50">Dipulihkan ke AI</p>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1">{stats.total_restored || 0} Sesi</h3>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
                        <div className="relative flex-1">
                            <MagnifyingGlass className="w-4 h-4 absolute left-3.5 top-3.5 text-[#f5efe4]/40" />
                            <input 
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari berdasarkan nomor HP, nama pelanggan, isi pesan..."
                                className="w-full bg-[#1a1714] border border-[#ebe6dd]/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[#f5efe4]/40 focus:outline-none focus:border-[#e98425]"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="px-4 py-2.5 bg-[#e98425] hover:bg-[#e98425]/90 text-black font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                            Cari
                        </button>
                        {search && (
                            <button 
                                type="button"
                                onClick={handleResetSearch}
                                className="px-3 py-2.5 border border-[#ebe6dd]/10 hover:bg-white/5 text-[#f5efe4]/70 text-xs rounded-xl transition-colors cursor-pointer"
                            >
                                Reset
                            </button>
                        )}
                    </form>
                </div>

                {/* Held Messages Table & Mobile Cards */}
                <div className="bg-[#141210] border border-[#ebe6dd]/10 rounded-2xl overflow-hidden shadow-xl">
                    
                    {/* Mobile Card List View (Visible < md) */}
                    <div className="md:hidden divide-y divide-[#ebe6dd]/10">
                        {logs.data && logs.data.length > 0 ? (
                            logs.data.map((log) => (
                                <div key={log.id} className="p-4 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <div className="font-bold text-white flex items-center gap-2 text-xs">
                                            <WhatsappLogo className="w-4 h-4 text-emerald-400 shrink-0" />
                                            <span>{log.customer_name || 'Calon Member'}</span>
                                        </div>
                                        <span className="font-mono text-[10px] text-[#f5efe4]/40">
                                            +{log.phone}
                                        </span>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-[#1a1714] border border-[#ebe6dd]/10 text-xs text-white/90 leading-relaxed font-mono">
                                        "{log.message}"
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                                        <span className="text-[#f5efe4]/50">
                                            {log.reason}
                                        </span>
                                        {log.status === 'restored' ? (
                                            <span className="text-emerald-400 font-bold">Dipulihkan</span>
                                        ) : log.is_cache_muted ? (
                                            <span className="text-red-400 font-bold animate-pulse">CS Mute (30m)</span>
                                        ) : (
                                            <span className="text-[#f5efe4]/50">Ditahan</span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                                        <span className="text-[10px] font-mono text-[#f5efe4]/40">
                                            {new Date(log.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {log.status !== 'restored' && (
                                                <button 
                                                    onClick={() => triggerRestoreModal(log)}
                                                    className="px-2.5 py-1 bg-[#e98425]/15 hover:bg-[#e98425] text-[#e98425] hover:text-black border border-[#e98425]/30 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                                >
                                                    <ArrowClockwise className="w-3 h-3" /> Restore AI
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => triggerDeleteModal(log.id)}
                                                className="p-1 text-red-400/60 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Trash className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-xs text-[#f5efe4]/40 font-mono">
                                Tidak ada log pesan ditahan yang ditemukan.
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View (Visible >= md) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left text-xs text-[#f5efe4]">
                            <thead className="bg-[#1a1714] border-b border-[#ebe6dd]/10 text-[#f5efe4]/50 font-mono uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4">Pelanggan</th>
                                    <th className="py-3.5 px-4">Pesan Yang Ditahan</th>
                                    <th className="py-3.5 px-4">Alasan Mute</th>
                                    <th className="py-3.5 px-4">Status AI</th>
                                    <th className="py-3.5 px-4">Waktu</th>
                                    <th className="py-3.5 px-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#ebe6dd]/5 font-sans">
                                {logs.data && logs.data.length > 0 ? (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                            {/* Customer Details */}
                                            <td className="py-3.5 px-4">
                                                <div className="font-bold text-white flex items-center gap-2">
                                                    <WhatsappLogo className="w-4 h-4 text-emerald-400 shrink-0" />
                                                    <span>{log.customer_name || 'Calon Member'}</span>
                                                </div>
                                                <div className="text-[11px] font-mono text-[#f5efe4]/50 mt-0.5">
                                                    +{log.phone}
                                                </div>
                                            </td>

                                            {/* Held Message Content */}
                                            <td className="py-3.5 px-4 max-w-md">
                                                <div className="p-2.5 rounded-lg bg-[#1a1714] border border-[#ebe6dd]/10 text-xs text-white/90 leading-relaxed font-mono">
                                                    "{log.message}"
                                                </div>
                                            </td>

                                            {/* Reason Badge */}
                                            <td className="py-3.5 px-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
                                                    <Clock className="w-3 h-3" />
                                                    {log.reason}
                                                </span>
                                            </td>

                                            {/* AI Status Badge */}
                                            <td className="py-3.5 px-4">
                                                {log.status === 'restored' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Dipulihkan ke AI
                                                    </span>
                                                ) : log.is_cache_muted ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
                                                        <ShieldSlash className="w-3 h-3" />
                                                        CS Mute Aktif (30m)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-white/5 border border-white/10 text-white/60">
                                                        Ditahan
                                                    </span>
                                                )}
                                            </td>

                                            {/* Timestamp */}
                                            <td className="py-3.5 px-4 font-mono text-[11px] text-[#f5efe4]/50">
                                                {new Date(log.created_at).toLocaleString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {log.status !== 'restored' && (
                                                        <button 
                                                            onClick={() => triggerRestoreModal(log)}
                                                            className="px-3 py-1.5 bg-[#e98425]/15 hover:bg-[#e98425] text-[#e98425] hover:text-black border border-[#e98425]/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                                            title="Kembalikan kontrol obrolan ke AI"
                                                        >
                                                            <ArrowClockwise className="w-3.5 h-3.5" />
                                                            <span>Restore AI</span>
                                                        </button>
                                                    )}

                                                    <button 
                                                        onClick={() => triggerDeleteModal(log.id)}
                                                        className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                                        title="Hapus log"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-[#f5efe4]/40 font-mono">
                                            Tidak ada log pesan ditahan yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Reusable Confirm Modal */}
            <ConfirmModal 
                isOpen={!!confirmAction}
                title={confirmAction?.title}
                message={confirmAction?.message}
                confirmText={confirmAction?.confirmText}
                type={confirmAction?.confirmType || 'info'}
                onConfirm={executeConfirmAction}
                onCancel={() => setConfirmAction(null)}
            />
        </AdminLayout>
    );
}
