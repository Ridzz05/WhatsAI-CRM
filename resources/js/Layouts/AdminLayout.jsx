import { useState } from 'react';
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
    SquaresFour
} from '@phosphor-icons/react';

export default function AdminLayout({ children, activeTab = 'dashboard', title = 'CRM Console' }) {
    const { auth } = usePage().props;
    const user = auth?.user || { name: 'M. Rizki Algipari', email: 'muhrizkialgipari@gmail.com' };
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Grouped Navigation Items (AUTOIN Dark Theme Architecture)
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
            id: 'promos',
            label: 'Knowledge Promos',
            icon: Tag,
            href: route('promos.index'),
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

    return (
        <div className="min-h-screen bg-[#090807] text-[#f5efe4] relative flex font-sans selection:bg-[#e98425] selection:text-black">
            
            {/* Background Ambient Glow */}
            <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-[#e98425]/5 via-transparent to-transparent opacity-80" />

            {/* SIDEBAR - Desktop (Fixed) & Mobile (Drawer) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#110f0e] border-r border-[#ebe6dd]/10 flex flex-col justify-between transition-transform duration-300 xl:translate-x-0 xl:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                <div className="flex flex-col gap-6 py-6 px-5 overflow-y-auto">
                    
                    {/* Logo & Workspace Context Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-[#ebe6dd]/10">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#e98425] to-[#f59e0b] flex items-center justify-center text-[#1a1714] font-black font-mono text-sm shadow-lg shadow-[#e98425]/20 select-none">
                                W
                            </div>
                            <div className="flex flex-col leading-tight">
                                <span className="font-extrabold text-base tracking-tight text-white font-sans flex items-center gap-1">
                                    WhatsAI <span className="text-[10px] font-mono font-bold bg-[#e98425]/20 text-[#e98425] px-1.5 py-0.5 rounded border border-[#e98425]/30">v2.0</span>
                                </span>
                                <span className="text-[10.5px] text-[#f5efe4]/40 font-mono">Workspace Admin</span>
                            </div>
                        </Link>

                        {/* Mobile Close Button */}
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="xl:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" weight="bold" />
                        </button>
                    </div>

                    {/* Operational Menu Group */}
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 px-3 mb-1.5 block">
                            Operasional & AI CRM
                        </span>
                        
                        {operationalNav.map((item) => {
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
                                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#1a1714]' : 'text-[#f5efe4]/40 group-hover:text-white'}`} weight="bold" />
                                        <span className="tracking-wide">{item.label}</span>
                                    </div>

                                    {item.badge && (
                                        <span className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                                            isActive 
                                                ? 'bg-[#1a1714]/20 text-[#1a1714]' 
                                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* System Settings Group */}
                    <div className="flex flex-col gap-1 pt-3 border-t border-[#ebe6dd]/10">
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/40 px-3 mb-1.5 block">
                            Pengaturan System
                        </span>
                        
                        {systemNav.map((item) => {
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
                                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#1a1714]' : 'text-[#f5efe4]/40 group-hover:text-white'}`} weight="bold" />
                                        <span className="tracking-wide">{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-[#ebe6dd]/10 flex flex-col gap-3 bg-[#0d0c0b]">
                    
                    {/* Support Button */}
                    <a
                        href="https://wa.me/6281222827630"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all"
                    >
                        <WhatsappLogo className="w-4 h-4" weight="fill" />
                        Hubungi Support (WA)
                    </a>

                    {/* User Profile */}
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

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm xl:hidden"
                />
            )}

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                
                {/* Header Topbar */}
                <header className="h-16 border-b border-[#ebe6dd]/10 px-6 flex items-center justify-between shrink-0 relative z-30 bg-[#0d0c0b]/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="xl:hidden p-2 rounded-xl border border-white/10 hover:bg-white/5 text-white"
                        >
                            <List className="w-5 h-5" weight="bold" />
                        </button>
                        <h2 className="font-bold text-sm text-white font-sans hidden sm:block">{title}</h2>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link 
                            href="/"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 text-[10px] font-bold font-mono uppercase tracking-widest text-[#f5efe4]/70 hover:text-white transition-colors"
                        >
                            <House className="w-3.5 h-3.5" weight="bold" /> Portal Utama
                        </Link>
                    </div>
                </header>

                {/* Main Content Container */}
                <main className="flex-1 p-6 relative z-10 bg-[#090807]">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
