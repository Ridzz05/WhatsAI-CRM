import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmModal from '@/Components/ConfirmModal';
import { Plus, Trash, Package, Tag, Buildings, CurrencyDollar, CheckCircle, Warning, Check, X } from '@phosphor-icons/react';

export default function ProductsIndex({ products, branches }) {
    const [name, setName] = useState('');
    const [branchId, setBranchId] = useState('');
    const [category, setCategory] = useState('Suplemen');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('50');
    const [description, setDescription] = useState('');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedDeleteId, setSelectedDeleteId] = useState(null);

    const handleCreate = (e) => {
        e.preventDefault();
        if (!name.trim() || !price) return;

        router.post(route('products.store'), {
            name,
            branch_id: branchId || null,
            category,
            price: parseFloat(price) || 0,
            stock: parseInt(stock) || 0,
            description,
        }, {
            onSuccess: () => {
                setName('');
                setPrice('');
                setDescription('');
            }
        });
    };

    const confirmDelete = (id) => {
        setSelectedDeleteId(id);
        setDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (!selectedDeleteId) return;
        router.delete(route('products.destroy', selectedDeleteId), {
            onSuccess: () => {
                setDeleteModalOpen(false);
                setSelectedDeleteId(null);
            }
        });
    };

    const formatRp = (val) => {
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(val);
    };

    return (
        <AdminLayout activeTab="products" title="Katalog Produk UMKM">
            <Head title="Katalog Produk & Inventaris" />

            <div className="flex flex-col xl:flex-row gap-6 relative z-10 p-1">
                {/* Form Tambah Produk (Left Sidebar Card) */}
                <div className="w-full xl:w-96 shrink-0">
                    <div className="bg-[#1a1714] border border-[#ebe6dd]/10 p-6 rounded-[24px] shadow-lg sticky top-6">
                        <span className="eyebrow-badge mb-4">
                            <span className="dot"></span>Product Catalog
                        </span>

                        <h2 className="font-extrabold text-xl text-white mt-4 mb-2">
                            Tambah <span className="serif-title italic text-[#e98425]">Produk Baru</span>
                        </h2>
                        <p className="text-xs text-[#f5efe4]/50 leading-relaxed mb-6">
                            Tambahkan barang retail, suplemen, atau voucher presale. AI akan merekomendasikan produk ini beserta harga & stoknya di WA.
                        </p>

                        <form onSubmit={handleCreate} className="flex flex-col gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Nama Produk *" />
                                <TextInput
                                    id="name"
                                    placeholder="Contoh: Whey Protein Isolate 2Lbs"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="category" value="Kategori" />
                                    <select
                                        id="category"
                                        className="mt-1 w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#e98425] text-white rounded-xl py-2 px-3 text-xs outline-none transition-all"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="Suplemen" className="bg-[#1a1714]">Suplemen</option>
                                        <option value="Merchandise" className="bg-[#1a1714]">Merchandise</option>
                                        <option value="Voucher Presale" className="bg-[#1a1714]">Voucher Presale</option>
                                        <option value="Jasa / Fitness PT" className="bg-[#1a1714]">Jasa / Fitness PT</option>
                                    </select>
                                </div>
                                <div>
                                    <InputLabel htmlFor="price" value="Harga (Rp) *" />
                                    <TextInput
                                        id="price"
                                        type="number"
                                        placeholder="450000"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <InputLabel htmlFor="stock" value="Jumlah Stok" />
                                    <TextInput
                                        id="stock"
                                        type="number"
                                        value={stock}
                                        onChange={(e) => setStock(e.target.value)}
                                        className="mt-1 block w-full"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="branch" value="Cabang Terkait" />
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
                            </div>

                            <div>
                                <InputLabel htmlFor="description" value="Deskripsi Singkat" />
                                <textarea
                                    id="description"
                                    placeholder="Penjelasan produk untuk AI WA..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#e98425] text-white rounded-xl py-2 px-3 text-xs outline-none h-20 resize-none transition-all"
                                />
                            </div>

                            <PrimaryButton type="submit" className="w-full justify-center">
                                + Simpan Produk Katalog
                            </PrimaryButton>
                        </form>
                    </div>
                </div>

                {/* Right Side: Product Catalog Grid */}
                <div className="flex-1">
                    <div className="bg-[#1a1714] border border-[#ebe6dd]/10 p-6 rounded-[24px] shadow-lg">
                        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Package className="w-6 h-6 text-[#e98425]" />
                                    Katalog Produk Terdaftar
                                </h3>
                                <p className="text-xs text-[#f5efe4]/50 mt-1">
                                    Total {products.length} produk aktif siap ditawarkan otomatis oleh AI Assistant.
                                </p>
                            </div>
                        </div>

                        {products.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                                <Package className="w-12 h-12 text-[#f5efe4]/20 mx-auto mb-3" />
                                <p className="text-[#f5efe4]/50 text-sm">Belum ada produk di katalog. Gunakan form di sebelah kiri untuk menambah produk baru.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {products.map((p) => (
                                    <div 
                                        key={p.id} 
                                        className="bg-[#24201c] border border-white/5 hover:border-[#e98425]/40 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between group"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#e98425]/10 text-[#e98425] border border-[#e98425]/20">
                                                    {p.category}
                                                </span>
                                                <button
                                                    onClick={() => confirmDelete(p.id)}
                                                    className="p-1.5 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                                                >
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <h4 className="text-base font-bold text-white group-hover:text-[#e98425] transition-colors">
                                                {p.name}
                                            </h4>
                                            {p.description && (
                                                <p className="text-xs text-[#f5efe4]/60 mt-1.5 line-clamp-2 leading-relaxed">
                                                    {p.description}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                                            <div>
                                                <div className="text-[10px] text-[#f5efe4]/40 uppercase tracking-wider font-semibold">Harga</div>
                                                <div className="text-base font-extrabold text-[#e98425]">{formatRp(p.price)}</div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-[10px] text-[#f5efe4]/40 uppercase tracking-wider font-semibold">Stok</div>
                                                <div className="font-semibold text-white flex items-center gap-1">
                                                    {p.stock > 0 ? (
                                                        <span className="text-emerald-400 flex items-center gap-1">
                                                            <CheckCircle className="w-3.5 h-3.5" /> {p.stock} pcs
                                                        </span>
                                                    ) : (
                                                        <span className="text-rose-400 flex items-center gap-1">
                                                            <Warning className="w-3.5 h-3.5" /> Habis
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={executeDelete}
                title="Hapus Produk dari Katalog?"
                message="Tindakan ini akan menghapus data produk dari katalog sistem."
            />
        </AdminLayout>
    );
}
