import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    EnvelopeSimple, 
    Lock, 
    Eye, 
    EyeSlash, 
    ArrowRight,
    WarningCircle
} from '@phosphor-icons/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log In - CRM Console" />

            <div className="flex flex-col gap-1.5 mb-6 text-center sm:text-left">
                <h1 className="text-xl font-black text-white tracking-tight">
                    CRM Console
                </h1>
                <p className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#e98425]">
                    Loyal Fitness Assistant
                </p>
            </div>

            {status && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-mono">{status}</span>
                </div>
            )}

            <form onSubmit={submit} className="flex flex-col gap-4">
                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-[9px] font-bold font-mono uppercase tracking-[0.15em] text-[#f5efe4]/40 flex items-center gap-1.5">
                        <EnvelopeSimple className="w-3.5 h-3.5 text-[#e98425]" />
                        Email Address
                    </label>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            required
                            placeholder="cs@loyalfitness.id"
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-2.5 px-4 rounded-xl text-white focus:border-[#e98425] outline-none transition-colors placeholder:text-white/15"
                        />
                    </div>
                    {errors.email && (
                        <div className="flex items-center gap-1 text-red-400 text-[10px] font-mono mt-0.5">
                            <WarningCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.email}</span>
                        </div>
                    )}
                </div>

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="text-[9px] font-bold font-mono uppercase tracking-[0.15em] text-[#f5efe4]/40 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#e98425]" />
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full bg-[#0e0d0c] border border-white/10 text-xs py-2.5 px-4 rounded-xl text-white focus:border-[#e98425] outline-none transition-colors placeholder:text-white/15 pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#f5efe4]/30 hover:text-white transition-colors"
                        >
                            {showPassword ? (
                                <EyeSlash className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && (
                        <div className="flex items-center gap-1 text-red-400 text-[10px] font-mono mt-0.5">
                            <WarningCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.password}</span>
                        </div>
                    )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center cursor-pointer select-none">
                        <input
                            type="checkbox"
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="w-3.5 h-3.5 rounded border-white/15 bg-[#0e0d0c] text-[#e98425] focus:ring-[#e98425] focus:ring-offset-[#141210]"
                        />
                        <span className="ms-2 text-[10px] font-mono text-[#f5efe4]/50">
                            Ingat saya
                        </span>
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-[10px] font-mono text-[#f5efe4]/40 hover:text-[#e98425] transition-colors"
                        >
                            Lupa sandi?
                        </Link>
                    )}
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-4 py-3 bg-[#e98425] hover:scale-[1.01] active:scale-[0.99] text-[#1a1714] font-black text-xs rounded-xl tracking-wider font-mono uppercase transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-55 disabled:cursor-not-allowed"
                >
                    {processing ? 'Memproses...' : 'Masuk Console'}
                    {!processing && <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" weight="bold" />}
                </button>
            </form>
        </GuestLayout>
    );
}
