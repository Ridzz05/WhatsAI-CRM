import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { Buildings, Plus, MapPin, Phone, CheckCircle, Storefront } from '@phosphor-icons/react';

export default function BranchesIndex({ branches }) {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [city, setCity] = useState('Palembang');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    const handleCreate = (e) => {
        e.preventDefault();
        if (!name.trim() || !code.trim()) return;

        router.post(route('branches.store'), {
            name,
            code,
            city,
            address,
            phone,
        }, {
            onSuccess: () => {
                setName('');
                setCode('');
                setAddress('');
                setPhone('');
            }
        });
    };

    return (
        <AdminLayout activeTab="branches" title="Manajemen Cabang UMKM">
            <Head title="Manajemen Cabang & Lokasi" />

            <div className="flex flex-col xl:flex-row gap-6 relative z-10 p-1">
                {/* Left Side: Create Branch Form */}
                <div className="w-full xl:w-96 shrink-0">
                    <div className="bg-[#1a1714] border border-[#ebe6dd]/10 p-6 rounded-[24px] shadow-lg sticky top-6">
                        <span className="eyebrow-badge mb-4">
                            <span className="dot"></span>Multi-Branch Router
                        </span>

                        <h2 className="font-extrabold text-xl text-white mt-4 mb-2">
                            Tambah <span className="serif-title italic text-[#e98425]">Cabang Baru</span>
                        </h2>
                        <p className="text-xs text-[#f5efe4]/50 leading-relaxed mb-6">
                            Tambahkan lokasi cabang UMKM Anda. AI akan secara otomatis merouting calon pelanggan ke CS cabang terdekat.
                        </p>

                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Nama Cabang *" />
                                <TextInput
                                    id="name"
                                    placeholder="Contoh: Loyal Fitness Prime PS"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="code" value="Kode Cabang *" />
                                    <TextInput
                                        id="code"
                                        placeholder="LF-PS"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="city" value="Kota" />
                                    <TextInput
                                        id="city"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="address" value="Alamat Lengkap" />
                                <textarea
                                    id="address"
                                    placeholder="Jl. Angkatan 45 Palembang Square..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="mt-1 w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#e98425] text-white rounded-xl py-2 px-3 text-xs outline-none h-20 resize-none transition-all"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="No WhatsApp Cabang" />
                                <TextInput
                                    id="phone"
                                    placeholder="628123456789"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>

                            <PrimaryButton type="submit" className="w-full justify-center">
                                + Simpan Data Cabang
                            </PrimaryButton>
                        </form>
                    </div>
                </div>

                {/* Right Side: Branches Grid */}
                <div className="flex-1">
                    <div className="bg-[#1a1714] border border-[#ebe6dd]/10 p-6 rounded-[24px] shadow-lg">
                        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Buildings className="w-6 h-6 text-[#e98425]" />
                                    Daftar Cabang Bisnis ({branches.length})
                                </h3>
                                <p className="text-xs text-[#f5efe4]/50 mt-1">
                                    Lokasi terdaftar untuk routing lead & penyesuaian lokasi otomatis oleh AI.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {branches.map((b) => (
                                <div 
                                    key={b.id} 
                                    className="bg-[#24201c] border border-white/5 hover:border-[#e98425]/40 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-[#e98425]/10 text-[#e98425] border border-[#e98425]/20">
                                                {b.code}
                                            </span>
                                            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/30">
                                                <CheckCircle className="w-3.5 h-3.5" /> Aktif
                                            </span>
                                        </div>

                                        <h4 className="text-lg font-bold text-white mb-3">
                                            {b.name}
                                        </h4>

                                        <div className="space-y-2 text-xs text-[#f5efe4]/70">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="w-4 h-4 text-[#e98425] shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{b.address || 'Alamat belum diisi'} ({b.city})</span>
                                            </div>
                                            {b.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-[#e98425] shrink-0" />
                                                    <span>+{b.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#f5efe4]/50">
                                        <span>Produk: <strong className="text-white">{b.products_count}</strong> items</span>
                                        <span>Leads: <strong className="text-white">{b.leads_count}</strong> kontak</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
