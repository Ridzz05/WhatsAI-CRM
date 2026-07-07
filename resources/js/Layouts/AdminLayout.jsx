import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Layout, 
    Gear, 
    SignOut, 
    House, 
    List, 
    X, 
    ChatCircleDots,
    Tag,
    User
} from '@phosphor-icons/react';

export default function AdminLayout({ children, activeTab = 'dashboard', title = 'CRM Console' }) {
    const { auth } = usePage().props;
    const user = auth?.user || { name: 'CS Agent', email: 'cs@loyalfitness.com' };
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Navigation items
    const navItems = [
        {
            id: 'dashboard',
            label: 'CRM Dashboard',
            icon: ChatCircleDots,
            href: route('dashboard'),
        },
        {
            id: 'promos',
            label: 'Knowledge Promos',
            icon: Tag,
            href: route('promos.index'),
        },
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
        <div className="min-h-screen text-[#f5efe4] relative flex">
            
            {/* Ambient gradients */}
            <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.02]"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
            />
            
            <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#e98425]/5 via-transparent to-transparent" />

            {/* SIDEBAR - Desktop (Fixed) & Mobile (Drawer) */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0e0d0c]/95 border-r border-[#ebe6dd]/10 flex flex-col justify-between transition-transform duration-300 xl:translate-x-0 xl:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                <div className="flex flex-col gap-8 py-8 px-6">
                    {/* Logo */}
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-lg bg-[#e98425] flex items-center justify-center text-[#1a1714] font-bold font-mono text-xs select-none">
                                L
                            </span>
                            <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                                level<span className="text-[#e98425] italic font-serif">.</span>cs
                            </span>
                        </Link>
                        {/* Close button for mobile */}
                        <button 
                            onClick={() => setSidebarOpen(false)}
                            className="xl:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" weight="bold" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col gap-1.5 mt-4">
                        <span className="text-[10px] font-medium font-mono uppercase tracking-widest text-[#f5efe4]/40 px-3 mb-2 block">
                            WhatsApp AI CRM
                        </span>
                        
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = activeTab === item.id;
                            
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all group ${
                                        isActive 
                                            ? 'bg-[#e98425]/15 text-[#e98425] border border-[#e98425]/10 shadow-[0_4px_15px_rgba(233,132,37,0.05)]' 
                                            : 'text-[#f5efe4]/50 hover:bg-white/5 hover:text-[#f5efe4] border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#e98425]' : 'text-[#f5efe4]/40 group-hover:text-[#f5efe4]/70'}`} weight="bold" />
                                        <span className="font-medium tracking-wide">{item.label}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer User Info */}
                <div className="p-6 border-t border-[#ebe6dd]/10 flex items-center justify-between text-xs relative z-10 bg-[#1a1714]/30">
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[#f5efe4] truncate">{user.name}</span>
                        <span className="text-[10.5px] font-mono text-[#f5efe4]/40 truncate mt-0.5">{user.email}</span>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="p-2.5 rounded-xl hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all shrink-0"
                        title="Log Out"
                    >
                        <SignOut className="w-4 h-4" weight="bold" />
                    </Link>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
                />
            )}

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                
                {/* Header Topbar */}
                <header className="h-16 border-b border-[#ebe6dd]/10 px-6 flex items-center justify-between shrink-0 relative z-30 bg-[#0e0d0c]/30 backdrop-blur-md">
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

                {/* Main panel */}
                <main className="flex-1 p-6 relative z-10 bg-[#0e0d0c]">
                    <div className="max-w-7xl mx-auto flex flex-col gap-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
