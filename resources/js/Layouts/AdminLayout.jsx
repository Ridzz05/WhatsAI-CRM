import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Gear, 
    SignOut, 
    House, 
    List, 
    X, 
    ChatCircleDots,
    Tag,
    User,
    DeviceMobile,
    FileText,
    WhatsappLogo,
    Question,
    SquaresFour,
    CirclesThree,
    Broadcast,
    Lightning,
    ShieldSlash,
    TerminalWindow,
    Bell,
    Package,
    Buildings,
    Receipt,
    Sun,
    Moon
} from '@phosphor-icons/react';

export default function AdminLayout({ children, activeTab = 'dashboard', title = 'CRM Console' }) {
    const { auth } = usePage().props;
    const user = auth?.user || { name: 'M. Rizki Algipari', email: 'muhrizkialgipari@gmail.com' };
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Dark/Light Theme state
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('crm_theme') || 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        localStorage.setItem('crm_theme', theme);
        if (theme === 'light') {
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Close sidebar on route change (mobile UX)
    useEffect(() => {
        setSidebarOpen(false);
    }, [activeTab]);

    // Prevent body scroll when sidebar open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    const operationalNav = [
        {
            id: 'dashboard',
            label: 'Dashboard CRM',
            icon: ChatCircleDots,
            href: route('dashboard'),
        },
        {
            id: 'device',
            label: 'Device Connected',
            icon: DeviceMobile,
            href: route('crm.device'),
            badge: 'Online'
        },
        {
            id: 'templates',
            label: 'Template Pesan',
            icon: FileText,
            href: route('crm.templates'),
        },
        {
            id: 'broadcast',
            label: 'Broadcast Pesan',
            icon: Broadcast,
            href: route('crm.broadcast'),
        },
        {
            id: 'quicksend',
            label: 'Kirim Cepat',
            icon: Lightning,
            href: route('crm.quick-send'),
        },
        {
            id: 'status',
            label: 'Jadwal Status WA',
            icon: CirclesThree,
            href: route('crm.status'),
        },
        {
            id: 'held-messages',
            label: 'Log Pesan Ditahan',
            icon: ShieldSlash,
            href: route('crm.held-messages'),
            badge: 'CS Mute'
        },
        {
            id: 'live-logs',
            label: 'Live System Logs',
            icon: TerminalWindow,
            href: route('crm.live-logs'),
            badge: 'Live'
        },
        {
            id: 'promos',
            label: 'Knowledge Promos',
            icon: Tag,
            href: route('promos.index'),
        },
        {
            id: 'products',
            label: 'Katalog Produk',
            icon: Package,
            href: route('crm.products'),
        },
        {
            id: 'branches',
            label: 'Cabang UMKM',
            icon: Buildings,
            href: route('crm.branches'),
        },
        {
            id: 'invoices',
            label: 'Invoice QRIS',
            icon: Receipt,
            href: route('crm.invoices'),
        }
    ];

    const systemNav = [
        {
            id: 'settings',
            label: 'Konfigurasi AI',
            icon: Gear,
            href: route('crm.settings'),
        },
        {
            id: 'profile',
            label: 'Profil Saya',
            icon: User,
            href: route('profile.edit'),
        }
    ];

    // Bottom nav items (most used — for mobile)
    const bottomNav = [
        { id: 'dashboard',  icon: ChatCircleDots, label: 'Home',      href: route('dashboard') },
        { id: 'broadcast',  icon: Broadcast,      label: 'Blast',     href: route('crm.broadcast') },
        { id: 'quicksend',  icon: Lightning,      label: 'Kirim',     href: route('crm.quick-send') },
        { id: 'device',     icon: DeviceMobile,   label: 'Device',    href: route('crm.device') },
        { id: '__menu__',   icon: List,           label: 'Menu',      href: null },
    ];

    const NavItem = ({ item }) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        return (
            <Link
                key={item.id}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                    isActive 
                        ? 'bg-[#e98425] text-[#1a1714] font-extrabold shadow-lg shadow-[#e98425]/15' 
                        : 'text-[#f5efe4]/60 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
            >
                <div className="flex items-center gap-3">
                    <IconComponent 
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1a1714]' : 'text-[#f5efe4]/40 group-hover:text-white'}`} 
                        weight="bold" 
                    />
                    <span className="tracking-wide truncate">{item.label}</span>
                </div>
                {item.badge && (
                    <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                        isActive 
                            ? 'bg-[#1a1714]/20 text-[#1a1714]' 
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}>
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-[#090807] text-[#f5efe4] relative flex font-sans selection:bg-[#e98425] selection:text-black">
            
            {/* Background Ambient Glow */}
            <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-[#e98425]/5 via-transparent to-transparent opacity-80" />

            {/* ─── SIDEBAR ───────────────────────────────────────────────────── */}
            {/* Desktop: static at lg+. Mobile/Tablet: off-canvas drawer */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-[#110f0e] border-r border-[#ebe6dd]/10 
                flex flex-col justify-between
                transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:z-auto
                ${sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black/60' : '-translate-x-full'}
            `}>
                <div className="flex flex-col gap-6 py-6 px-5 overflow-y-auto flex-1">
                    
                    {/* Logo & Workspace Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#ebe6dd]/10">
                        <Link href="/" className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e98425] to-[#f59e0b] flex items-center justify-center text-[#1a1714] font-black font-mono text-sm shadow-lg shadow-[#e98425]/20 select-none shrink-0">
                                W
                            </div>
                            <div className="flex flex-col leading-tight min-w-0">
                                <span className="font-extrabold text-base tracking-tight text-white font-sans flex items-center gap-1">
                                    WhatsAI <span className="text-[10px] font-mono font-bold bg-[#e98425]/20 text-[#e98425] px-1.5 py-0.5 rounded border border-[#e98425]/30">v2.0</span>
                                </span>
                                <span className="text-[10.5px] text-[#f5efe4]/40 font-mono truncate">Workspace Admin</span>
                            </div>
                        </Link>

                        {/* Mobile/Tablet Close Button */}
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors shrink-0"
                            aria-label="Tutup menu"
                        >
                            <X className="w-5 h-5" weight="bold" />
                        </button>
                    </div>

                    {/* Operational Menu */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 px-3 mb-1.5 block">
                            Operasional & AI CRM
                        </span>
                        {operationalNav.map((item) => <NavItem key={item.id} item={item} />)}
                    </div>

                    {/* System Settings */}
                    <div className="flex flex-col gap-1 pt-3 border-t border-[#ebe6dd]/10">
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 px-3 mb-1.5 block">
                            Pengaturan System
                        </span>
                        {systemNav.map((item) => <NavItem key={item.id} item={item} />)}
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-[#ebe6dd]/10 flex flex-col gap-3 bg-[#0d0c0b] shrink-0">
                    <a
                        href="https://wa.me/6281222827630"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
                    >
                        <WhatsappLogo className="w-4 h-4" weight="fill" />
                        Hubungi Support (WA)
                    </a>

                    <div className="flex items-center justify-between text-xs pt-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#e98425]/20 border border-[#e98425]/40 flex items-center justify-center text-[#e98425] font-bold text-xs shrink-0">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold text-white truncate text-[11.5px] leading-tight">{user.name}</span>
                                <span className="text-[10px] font-mono text-[#f5efe4]/40 truncate mt-0.5">{user.email}</span>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all shrink-0"
                            title="Log Out"
                        >
                            <SignOut className="w-4 h-4" weight="bold" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile/Tablet Backdrop Overlay */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
                    aria-hidden="true"
                />
            )}

            {/* ─── MAIN CONTENT AREA ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                
                {/* Topbar Header */}
                <header className="h-14 sm:h-16 border-b border-[#ebe6dd]/10 px-4 sm:px-6 flex items-center justify-between shrink-0 relative z-30 bg-[#0d0c0b]/90 backdrop-blur-md sticky top-0">
                    <div className="flex items-center gap-3">
                        {/* Hamburger — shown below lg */}
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl border border-white/10 hover:bg-white/5 text-white transition-colors"
                            aria-label="Buka menu"
                        >
                            <List className="w-5 h-5" weight="bold" />
                        </button>

                        {/* Page Title */}
                        <div className="flex flex-col">
                            <h2 className="font-bold text-sm text-white font-sans leading-tight line-clamp-1">{title}</h2>
                            <span className="text-[10px] text-[#f5efe4]/40 font-mono hidden sm:block">WhatsAI CRM v2.0</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* User avatar (mobile: compact) */}
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#e98425]/20 border border-[#e98425]/40 flex items-center justify-center text-[#e98425] font-bold text-xs shrink-0">
                                {user.name.charAt(0)}
                            </div>
                            <span className="hidden md:block text-xs font-bold text-white truncate max-w-[120px]">{user.name}</span>
                        </div>

                        {/* Theme Toggle Button (Dark / Light) */}
                        <button
                            onClick={toggleTheme}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 text-[10px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/70 hover:text-white transition-all cursor-pointer"
                            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                        >
                            {theme === 'dark' ? (
                                <>
                                    <Sun className="w-3.5 h-3.5 text-amber-400" weight="bold" />
                                    <span className="hidden sm:inline">Light</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="w-3.5 h-3.5 text-indigo-400" weight="bold" />
                                    <span className="hidden sm:inline">Dark</span>
                                </>
                            )}
                        </button>

                        <Link 
                            href="/"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 text-[10px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/70 hover:text-white transition-colors"
                        >
                            <House className="w-3.5 h-3.5" weight="bold" /> Portal
                        </Link>
                    </div>
                </header>

                {/* Page Content — extra bottom padding on mobile for bottom nav */}
                <main className="flex-1 p-4 sm:p-6 relative z-10 bg-[#090807] pb-24 lg:pb-6">
                    <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6">
                        {children}
                    </div>
                </main>
            </div>

            {/* ─── MOBILE BOTTOM NAVIGATION BAR ──────────────────────────────── */}
            {/* Visible only below lg breakpoint */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#110f0e]/95 backdrop-blur-xl border-t border-[#ebe6dd]/10 flex items-stretch h-16 safe-bottom">
                {bottomNav.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === item.id;

                    if (item.id === '__menu__') {
                        return (
                            <button
                                key="menu"
                                onClick={() => setSidebarOpen(true)}
                                className="flex-1 flex flex-col items-center justify-center gap-1 text-[#f5efe4]/50 hover:text-white transition-colors"
                            >
                                <IconComponent className="w-5 h-5" weight="bold" />
                                <span className="text-[9px] font-bold font-mono">Menu</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                                isActive 
                                    ? 'text-[#e98425]' 
                                    : 'text-[#f5efe4]/50 hover:text-white'
                            }`}
                        >
                            <div className="relative">
                                <IconComponent className="w-5 h-5" weight={isActive ? 'fill' : 'bold'} />
                                {isActive && (
                                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#e98425]" />
                                )}
                            </div>
                            <span className={`text-[9px] font-bold font-mono ${isActive ? 'text-[#e98425]' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
