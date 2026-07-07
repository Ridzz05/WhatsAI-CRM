import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmModal from '@/Components/ConfirmModal';
import { Plus, Trash, Pencil, Tag, List, CalendarBlank, Coin, Gift, Check, X } from '@phosphor-icons/react';

export default function PromosIndex({ promos }) {
    // Form states
    const [promoName, setPromoName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [bonus, setBonus] = useState('');
    const [validUntil, setValidUntil] = useState('');
    const [terms, setTerms] = useState('');

    // Editing states
    const [editPromo, setEditPromo] = useState(null);
    const [editPromoName, setEditPromoName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editBonus, setEditBonus] = useState('');
    const [editValidUntil, setEditValidUntil] = useState('');
    const [editTerms, setEditTerms] = useState('');
    const [editIsActive, setEditIsActive] = useState(true);

    // Delete Modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    const handleCreate = (e) => {
        e.preventDefault();
        if (!promoName.trim() || !price) return;

        router.post(route('promos.store'), {
            promo_name: promoName,
            description,
            price: parseFloat(price) || 0,
            bonus,
            valid_until: validUntil || null,
            terms,
        }, {
            onSuccess: () => {
                setPromoName('');
                setDescription('');
                setPrice('');
                setBonus('');
                setValidUntil('');
                setTerms('');
            }
        });
    };

    const startEdit = (promo) => {
        setEditPromo(promo);
        setEditPromoName(promo.promo_name);
        setEditDescription(promo.description || '');
        setEditPrice(promo.price.toString());
        setEditBonus(promo.bonus || '');
        setEditValidUntil(promo.valid_until ? promo.valid_until.substring(0, 10) : '');
        setEditTerms(promo.terms || '');
        setEditIsActive(promo.is_active === 1 || promo.is_active === true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!editPromoName.trim() || !editPrice || !editPromo) return;

        router.put(route('promos.update', editPromo.id), {
            promo_name: editPromoName,
            description: editDescription,
            price: parseFloat(editPrice) || 0,
            bonus: editBonus,
            valid_until: editValidUntil || null,
            terms: editTerms,
            is_active: editIsActive ? 1 : 0,
        }, {
            onSuccess: () => {
                setEditPromo(null);
            }
        });
    };

    const triggerDelete = (id) => {
        setSelectedDeleteId(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (!selectedDeleteId) return;
        router.delete(route('promos.destroy', selectedDeleteId), {
            onFinish: () => {
                setDeleteModalOpen(false);
                setSelectedDeleteId(null);
            }
        });
    };

    const formatRp = (val) => {
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(val);
    };

    return (
        <AdminLayout activeTab="promos" title="Basis Data Promo AI">
            <Head title="Knowledge Base Promo" />

            <div className="flex flex-col xl:flex-row gap-6 relative z-10 p-1">
                
                {/* Left Side: Create / Edit Form */}
                <div className="w-full xl:w-96 shrink-0">
                    
                    {!editPromo ? (
                        /* ADD PROMO FORM */
                        <div className="bg-[#1a1714] border border-[#ebe6dd]/10 p-6 rounded-[24px] shadow-lg sticky top-6">
                            <span className="eyebrow-badge mb-4">
                                <span className="dot"></span>Knowledge Base
                            </span>
                            
                            <h2 className="font-extrabold text-xl text-white mt-4 mb-2">
                                Tambah <span className="serif-title italic text-[#e98425]">Promo Baru</span>
                            </h2>
                            <p className="text-xs text-[#f5efe4]/50 leading-relaxed mb-6">
                                Tambahkan data promo gym baru. Data ini otomatis dibaca AI untuk menjawab pertanyaan calon member secara real-time.
                            </p>

                            <form onSubmit={handleCreate} className="flex flex-col gap-4">
                                <div>
                                    <InputLabel htmlFor="promo_name" value="Nama Promo" />
                                    <TextInput 
                                        id="promo_name"
                                        placeholder="Contoh: Promo Juli Ceria 12 Bulan"
                                        value={promoName}
                                        onChange={(e) => setPromoName(e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="price" value="Harga Promo" />
                                        <TextInput 
                                            id="price"
                                            type="number"
                                            placeholder="Contoh: 2900000"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="valid_until" value="Berlaku S/D (Optional)" />
                                        <TextInput 
                                            id="valid_until"
                                            type="date"
                                            value={validUntil}
                                            onChange={(e) => setValidUntil(e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="bonus" value="Bonus Promo" />
                                    <TextInput 
                                        id="bonus"
                                        placeholder="Contoh: Free PT session 2x & Tas Gym"
                                        value={bonus}
                                        onChange={(e) => setBonus(e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description" value="Deskripsi Pendek" />
                                    <textarea 
                                        id="description"
                                        placeholder="Tulis ringkasan singkat promo untuk AI..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="mt-1 w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#e98425] text-white rounded-xl py-2 px-3 text-xs outline-none h-16 resize-none transition-all"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="terms" value="Syarat & Ketentuan" />
                                    <textarea 
                                        id="terms"
                                        placeholder="Contoh: Hanya untuk member baru yang bayar cash/transfer lunas..."
                                        value={terms}
                                        onChange={(e) => setTerms(e.target.value)}
                                        className="mt-1 w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#e98425] text-white rounded-xl py-2 px-3 text-xs outline-none h-16 resize-none transition-all"
                                    />
                                </div>

                                <PrimaryButton type="submit">
                                    <Plus className="w-4.5 h-4.5" weight="bold" /> Simpan Promo
                                </PrimaryButton>
                            </form>
                        </div>
                    ) : (
                        /* EDIT PROMO FORM */
                        <div className="bg-[#1a1714] border border-[#ff6b3d]/20 p-6 rounded-[24px] shadow-lg sticky top-6">
                            <span className="eyebrow-badge mb-4">
                                <span className="dot"></span>Mode Edit KB
                            </span>
                            
                            <h2 className="font-extrabold text-xl text-white mt-4 mb-2">
                                Edit <span className="serif-title italic text-[#ff6b3d]">Data Promo</span>
                            </h2>
                            <p className="text-xs text-[#f5efe4]/50 leading-relaxed mb-6">
                                Perbarui parameter promo agar bot AI Anda merespons informasi yang ter-update ke calon pelanggan.
                            </p>

                            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                                <div>
                                    <InputLabel htmlFor="edit_promo_name" value="Nama Promo" />
                                    <TextInput 
                                        id="edit_promo_name"
                                        value={editPromoName}
                                        onChange={(e) => setEditPromoName(e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="edit_price" value="Harga Promo" />
                                        <TextInput 
                                            id="edit_price"
                                            type="number"
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                            className="mt-1 block w-full"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="edit_valid_until" value="Berlaku S/D" />
                                        <TextInput 
                                            id="edit_valid_until"
                                            type="date"
                                            value={editValidUntil}
                                            onChange={(e) => setEditValidUntil(e.target.value)}
                                            className="mt-1 block w-full"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit_bonus" value="Bonus Promo" />
                                    <TextInput 
                                        id="edit_bonus"
                                        value={editBonus}
                                        onChange={(e) => setEditBonus(e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit_status" value="Status Aktif AI" />
                                    <select
                                        id="edit_status"
                                        value={editIsActive ? '1' : '0'}
                                        onChange={(e) => setEditIsActive(e.target.value === '1')}
                                        className="mt-1 w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#ff6b3d] focus:outline-none rounded-xl text-xs py-2.5 px-4 text-white font-mono transition-all"
                                    >
                                        <option value="1" className="text-black bg-white">Aktif (Dijawab AI)</option>
                                        <option value="0" className="text-black bg-white">Nonaktif (AI Abaikan)</option>
                                    </select>
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit_description" value="Deskripsi Pendek" />
                                    <textarea 
                                        id="edit_description"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="mt-1 w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#ff6b3d] text-white rounded-xl py-2 px-3 text-xs outline-none h-16 resize-none transition-all"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="edit_terms" value="Syarat & Ketentuan" />
                                    <textarea 
                                        id="edit_terms"
                                        value={editTerms}
                                        onChange={(e) => setEditTerms(e.target.value)}
                                        className="mt-1 w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#ff6b3d] text-white rounded-xl py-2 px-3 text-xs outline-none h-16 resize-none transition-all"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setEditPromo(null)}
                                        className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-white font-semibold rounded-full transition-all text-xs font-mono uppercase tracking-widest cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-3 bg-[#ff6b3d] text-[#1a1714] font-bold rounded-full hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 shadow-[0_4px_20px_rgba(255,107,61,0.15)] text-xs font-mono uppercase tracking-widest cursor-pointer"
                                    >
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right Side: Promos List Table */}
                <div className="flex-1">
                    <div className="bg-[#1a1714] border border-[#ebe6dd]/10 rounded-[24px] p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <List className="w-5 h-5 text-[#e98425]" />
                            <h2 className="font-bold text-lg text-white">Daftar Promo Aktif (Basis Pengetahuan AI)</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-white/10 text-[#f5efe4]/40 font-bold uppercase tracking-wider text-[9px] font-mono">
                                        <th className="pb-3.5 pl-2">Nama Promo</th>
                                        <th className="pb-3.5">Harga</th>
                                        <th className="pb-3.5">Bonus</th>
                                        <th className="pb-3.5">Berlaku S/D</th>
                                        <th className="pb-3.5 text-center">Status AI</th>
                                        <th className="pb-3.5 text-right pr-2">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {promos.map((p) => (
                                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                            
                                            {/* Promo Name & Description */}
                                            <td className="py-4 pl-2 font-bold text-white max-w-[200px] truncate">
                                                <div className="flex flex-col">
                                                    <span>{p.promo_name}</span>
                                                    <span className="text-[10px] text-[#f5efe4]/40 font-normal truncate mt-0.5">{p.description || 'Tidak ada deskripsi'}</span>
                                                </div>
                                            </td>

                                            {/* Price */}
                                            <td className="py-4 font-mono font-bold text-[#e98425]">
                                                {formatRp(p.price)}
                                            </td>

                                            {/* Bonus */}
                                            <td className="py-4 text-[#f5efe4]/70 max-w-[120px] truncate">
                                                {p.bonus || '-'}
                                            </td>

                                            {/* Valid Until */}
                                            <td className="py-4 font-mono text-[#f5efe4]/50">
                                                {p.valid_until ? new Date(p.valid_until).toLocaleDateString('id-ID') : 'Seterusnya'}
                                            </td>

                                            {/* Status active */}
                                            <td className="py-4 text-center">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide ${
                                                    p.is_active
                                                        ? 'bg-[#d2eecb]/15 text-[#6cba5b]'
                                                        : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                    {p.is_active ? 'AKTIF' : 'NONAKTIF'}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 text-right pr-2">
                                                <div className="flex justify-end gap-1.5">
                                                    <button 
                                                        onClick={() => startEdit(p)}
                                                        className="p-1.5 bg-white/5 hover:bg-white/10 text-[#f5efe4]/60 hover:text-white rounded-lg transition-all cursor-pointer"
                                                        title="Ubah Promo"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => triggerDelete(p.id)}
                                                        className="p-1.5 bg-[#ff6b3d]/10 hover:bg-[#ff6b3d]/20 text-[#ff6b3d] rounded-lg transition-all cursor-pointer"
                                                        title="Hapus Promo"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>

                                        </tr>
                                    ))}

                                    {promos.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-[#f5efe4]/30 italic">
                                                Belum ada promo yang disetup. AI saat ini akan menjawab dengan harga/fasilitas dasar gym.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>

            {/* Reusable ConfirmModal for Promo Deletion */}
            <ConfirmModal 
                isOpen={deleteModalOpen}
                title="Hapus Data Promo?"
                message="Tindakan ini akan menghapus data promo secara permanen dari basis pengetahuan AI. Apakah Anda yakin?"
                confirmText="Hapus"
                cancelText="Batal"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModalOpen(false)}
            />
        </AdminLayout>
    );
}
