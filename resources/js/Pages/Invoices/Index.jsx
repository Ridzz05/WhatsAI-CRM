import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Receipt, QrCode, CheckCircle, Clock, Copy, Check } from '@phosphor-icons/react';

export default function InvoicesIndex({ invoices }) {
    const [copiedId, setCopiedId] = useState(null);

    const handleCopyUrl = (id, url) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatRp = (val) => {
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(val);
    };

    return (
        <AdminLayout activeTab="invoices" title="Invoice & Payment Links QRIS">
            <Head title="Invoice & Payment Links QRIS" />

            <div className="space-y-6 relative z-10 p-1">
                {/* Header Banner */}
                <div className="bg-[#1a1714] border border-[#ebe6dd]/10 p-6 rounded-[24px] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <span className="eyebrow-badge mb-3">
                            <span className="dot"></span>Conversational Checkout
                        </span>
                        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 mt-2">
                            <Receipt className="w-7 h-7 text-[#e98425]" />
                            Invoice & <span className="serif-title italic text-[#e98425]">Link Pembayaran QRIS</span>
                        </h1>
                        <p className="text-xs text-[#f5efe4]/50 leading-relaxed mt-1">
                            Daftar link pembayaran instan dan QRIS yang dibuat langsung dari obrolan WhatsApp CRM untuk transaksi cepat.
                        </p>
                    </div>
                </div>

                {/* Table Log Invoice */}
                <div className="bg-[#1a1714] border border-[#ebe6dd]/10 rounded-[24px] shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-bold text-white text-lg">Riwayat Payment Links & Invoice ({invoices.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-[#f5efe4]/80">
                            <thead className="bg-[#24201c] text-[#f5efe4]/50 font-semibold uppercase text-[11px] tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">No Invoice</th>
                                    <th className="px-6 py-4">Pelanggan / Phone</th>
                                    <th className="px-6 py-4">Total Nominal</th>
                                    <th className="px-6 py-4">Metode</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Payment Link</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-12 text-[#f5efe4]/40">
                                            Belum ada invoice yang dibuat. Anda dapat meng-generate link invoice di sidebar obrolan lead.
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 font-mono font-bold text-white">
                                                {inv.invoice_number}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-white">{inv.lead ? inv.lead.name || 'Calon Member' : '-'}</div>
                                                <div className="text-xs text-[#f5efe4]/50">+{inv.lead ? inv.lead.phone : '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 font-extrabold text-[#e98425]">
                                                {formatRp(inv.amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#e98425]/10 text-[#e98425] border border-[#e98425]/20 inline-flex items-center gap-1">
                                                    <QrCode className="w-3.5 h-3.5" /> {inv.payment_method || 'QRIS'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {inv.payment_status === 'paid' ? (
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 inline-flex items-center gap-1">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Lunas
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/40 inline-flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" /> Menunggu Pembayaran
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleCopyUrl(inv.id, inv.payment_url)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#24201c] hover:bg-[#2d2924] border border-white/10 text-white text-xs font-medium rounded-xl transition-all"
                                                >
                                                    {copiedId === inv.id ? (
                                                        <>
                                                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Tersalin!
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy className="w-3.5 h-3.5 text-[#e98425]" /> Salin Link WA
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
