import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e0d0c] text-[#f5efe4] relative overflow-hidden px-4 py-8">
            
            {/* Ambient glows */}
            <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 bg-[#e98425]/10 rounded-full blur-[100px] z-0" />
            <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 bg-[#e98425]/10 rounded-full blur-[100px] z-0" />
            
            {/* Grain texture overlay */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
            />

            {/* Content Container */}
            <div className="w-full sm:max-w-md relative z-10 flex flex-col items-center">
                
                {/* Logo & Header */}
                <div className="mb-8 hover:scale-105 transition-transform duration-300">
                    <Link href="/">
                        <ApplicationLogo className="w-24 h-24 object-contain filter drop-shadow-[0_0_15px_rgba(233,132,37,0.2)]" />
                    </Link>
                </div>

                {/* Main Card (Glassmorphic) */}
                <div className="w-full bg-[#141210]/80 border border-white/[0.06] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
                    {children}
                </div>

                {/* Footer Info */}
                <p className="mt-8 text-[9px] font-mono uppercase tracking-[0.2em] text-[#f5efe4]/30 text-center">
                    CRM Console &copy; {new Date().getFullYear()} Loyal Fitness
                </p>
            </div>
        </div>
    );
}
