import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Transition } from '@headlessui/react';
import { 
    User, 
    EnvelopeSimple, 
    Lock, 
    ShieldCheck, 
    Trash, 
    Warning,
    Check,
    Eye,
    EyeSlash,
    Gear
} from '@phosphor-icons/react';

function ProfileCard({ icon: Icon, title, description, accentColor = '#e98425', children }) {
    return (
        <div className="bg-[#141210]/80 border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-white/[0.04]">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
                        <Icon className="w-4 h-4" style={{ color: accentColor }} weight="bold" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
                        <p className="text-[10px] text-[#f5efe4]/35 mt-0.5">{description}</p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}

function InputField({ label, id, type = 'text', value, onChange, error, placeholder, required, inputRef, autoComplete, icon: Icon }) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-[9px] font-bold font-mono uppercase tracking-[0.15em] text-[#f5efe4]/40 flex items-center gap-1.5">
                {Icon && <Icon className="w-3 h-3 text-[#e98425]" />}
                {label}
            </label>
            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    required={required}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-2.5 px-4 rounded-xl text-white focus:border-[#e98425] outline-none transition-colors placeholder:text-white/15 pr-10"
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                    >
                        {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            {error && <span className="text-red-400 text-[10px] font-mono mt-0.5">{error}</span>}
        </div>
    );
}

function SuccessToast({ show, message = 'Berhasil disimpan!' }) {
    return (
        <Transition
            show={show}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-1 translate-y-0"
            leave="transition ease-in duration-200"
            leaveTo="opacity-0 translate-y-2"
        >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <Check className="w-3.5 h-3.5 text-emerald-400" weight="bold" />
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">{message}</span>
            </div>
        </Transition>
    );
}

export default function Edit({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const passwordInputRef = useRef();
    const currentPasswordRef = useRef();
    const deletePasswordRef = useRef();

    // Profile Information Form
    const profileForm = useForm({
        name: user.name,
        email: user.email,
    });

    // Password Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Delete Form
    const deleteForm = useForm({
        password: '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        profileForm.patch(route('profile.update'));
    };

    const submitPassword = (e) => {
        e.preventDefault();
        passwordForm.put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
            onError: (errors) => {
                if (errors.password) {
                    passwordForm.reset('password', 'password_confirmation');
                    passwordInputRef.current?.focus();
                }
                if (errors.current_password) {
                    passwordForm.reset('current_password');
                    currentPasswordRef.current?.focus();
                }
            },
        });
    };

    const submitDelete = (e) => {
        e.preventDefault();
        deleteForm.delete(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => setConfirmingDeletion(false),
            onError: () => deletePasswordRef.current?.focus(),
            onFinish: () => deleteForm.reset(),
        });
    };

    // Avatar initials
    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <AdminLayout activeTab="profile" title="Profil Saya">
            <Head title="Profil Saya" />

            <div className="flex flex-col gap-6 relative z-10">
                {/* Page Header */}
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[#e98425]">
                        <Gear className="w-4 h-4" weight="bold" />
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest">Account Settings</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white tracking-tight">
                        Profil & Keamanan
                    </h1>
                </div>

                {/* Profile Overview Banner */}
                <div className="bg-gradient-to-r from-[#e98425]/10 via-[#141210] to-[#141210] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#e98425] to-[#d4721f] flex items-center justify-center shadow-lg shadow-[#e98425]/15">
                            <span className="text-xl font-black text-[#1a1714] tracking-wider">{initials}</span>
                        </div>
                        <div className="flex flex-col gap-1 min-w-0">
                            <h2 className="text-lg font-extrabold text-white tracking-tight truncate">{user.name}</h2>
                            <p className="text-xs text-[#f5efe4]/40 font-mono truncate">{user.email}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[9px] text-emerald-400/70 font-mono font-bold uppercase tracking-wider">Active Session</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* Update Profile Information */}
                    <ProfileCard 
                        icon={User} 
                        title="Informasi Profil" 
                        description="Perbarui nama dan email akun Anda"
                    >
                        <form onSubmit={submitProfile} className="flex flex-col gap-4">
                            <InputField
                                label="Nama Lengkap"
                                id="profile_name"
                                icon={User}
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                error={profileForm.errors.name}
                                placeholder="Masukkan nama lengkap"
                                required
                                autoComplete="name"
                            />
                            <InputField
                                label="Alamat Email"
                                id="profile_email"
                                type="email"
                                icon={EnvelopeSimple}
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                error={profileForm.errors.email}
                                placeholder="email@contoh.com"
                                required
                                autoComplete="username"
                            />

                            {mustVerifyEmail && user.email_verified_at === null && (
                                <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <Warning className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" weight="bold" />
                                    <div className="text-[10px] text-amber-300/80">
                                        Email Anda belum diverifikasi.{' '}
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="underline hover:text-amber-200 transition-colors"
                                        >
                                            Kirim ulang email verifikasi.
                                        </Link>
                                        {status === 'verification-link-sent' && (
                                            <span className="block mt-1 text-emerald-400">
                                                Link verifikasi baru telah dikirim ke email Anda.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                                <button
                                    type="submit"
                                    disabled={profileForm.processing}
                                    className="px-5 py-2.5 bg-[#e98425] hover:scale-[1.02] active:scale-[0.98] text-[#1a1714] font-extrabold text-[10px] rounded-xl tracking-wider font-mono uppercase transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                                >
                                    {profileForm.processing ? 'Menyimpan...' : 'Simpan Profil'}
                                </button>
                                <SuccessToast show={profileForm.recentlySuccessful} message="Profil berhasil diperbarui!" />
                            </div>
                        </form>
                    </ProfileCard>

                    {/* Update Password */}
                    <ProfileCard 
                        icon={Lock} 
                        title="Ubah Password" 
                        description="Gunakan password yang kuat dan unik"
                        accentColor="#3b82f6"
                    >
                        <form onSubmit={submitPassword} className="flex flex-col gap-4">
                            <InputField
                                label="Password Saat Ini"
                                id="current_password"
                                type="password"
                                icon={Lock}
                                inputRef={currentPasswordRef}
                                value={passwordForm.data.current_password}
                                onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                error={passwordForm.errors.current_password}
                                placeholder="••••••••"
                                autoComplete="current-password"
                            />
                            <InputField
                                label="Password Baru"
                                id="new_password"
                                type="password"
                                icon={ShieldCheck}
                                inputRef={passwordInputRef}
                                value={passwordForm.data.password}
                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                error={passwordForm.errors.password}
                                placeholder="Minimal 8 karakter"
                                autoComplete="new-password"
                            />
                            <InputField
                                label="Konfirmasi Password Baru"
                                id="password_confirmation"
                                type="password"
                                icon={ShieldCheck}
                                value={passwordForm.data.password_confirmation}
                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                error={passwordForm.errors.password_confirmation}
                                placeholder="Ketik ulang password baru"
                                autoComplete="new-password"
                            />

                            <div className="flex items-center justify-between mt-2">
                                <button
                                    type="submit"
                                    disabled={passwordForm.processing}
                                    className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 hover:scale-[1.02] active:scale-[0.98] text-white font-extrabold text-[10px] rounded-xl tracking-wider font-mono uppercase transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                                >
                                    {passwordForm.processing ? 'Menyimpan...' : 'Update Password'}
                                </button>
                                <SuccessToast show={passwordForm.recentlySuccessful} message="Password berhasil diperbarui!" />
                            </div>
                        </form>
                    </ProfileCard>
                </div>

                {/* Danger Zone - Full Width */}
                <div className="bg-[#141210]/80 border border-red-500/10 rounded-2xl overflow-hidden">
                    <div className="px-6 pt-6 pb-4 border-b border-red-500/[0.06]">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20">
                                <Trash className="w-4 h-4 text-red-400" weight="bold" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-red-300 tracking-wide">Danger Zone</h3>
                                <p className="text-[10px] text-red-400/40 mt-0.5">Tindakan ini bersifat permanen dan tidak dapat dibatalkan</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        {!confirmingDeletion ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-[#f5efe4]/50 max-w-md">
                                        Menghapus akun akan menghilangkan seluruh data dan riwayat percakapan Anda secara permanen. Pastikan Anda telah mengunduh data yang diperlukan.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setConfirmingDeletion(true)}
                                    className="shrink-0 ml-4 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 font-extrabold text-[10px] rounded-xl tracking-wider font-mono uppercase transition-all duration-200 cursor-pointer"
                                >
                                    Hapus Akun
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={submitDelete} className="flex flex-col gap-4">
                                <div className="flex items-start gap-2.5 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                                    <Warning className="w-4 h-4 text-red-400 mt-0.5 shrink-0" weight="bold" />
                                    <p className="text-[11px] text-red-300/70 leading-relaxed">
                                        Apakah Anda yakin? Masukkan password Anda untuk mengkonfirmasi penghapusan akun secara permanen.
                                    </p>
                                </div>
                                <InputField
                                    label="Konfirmasi Password"
                                    id="delete_password"
                                    type="password"
                                    icon={Lock}
                                    inputRef={deletePasswordRef}
                                    value={deleteForm.data.password}
                                    onChange={(e) => deleteForm.setData('password', e.target.value)}
                                    error={deleteForm.errors.password}
                                    placeholder="Masukkan password untuk konfirmasi"
                                />
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setConfirmingDeletion(false);
                                            deleteForm.clearErrors();
                                            deleteForm.reset();
                                        }}
                                        className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-extrabold text-[10px] rounded-xl tracking-wider font-mono uppercase transition-all duration-200 cursor-pointer"
                                    >
                                        Batalkan
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={deleteForm.processing}
                                        className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10px] rounded-xl tracking-wider font-mono uppercase transition-all duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                                    >
                                        {deleteForm.processing ? 'Menghapus...' : 'Ya, Hapus Akun Saya'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
