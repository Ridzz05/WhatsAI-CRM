import { Link } from '@inertiajs/react';
import { CaretRight, House } from '@phosphor-icons/react';

export default function Breadcrumb({ items = [] }) {
    return (
        <nav className="flex items-center gap-2 text-xs font-mono text-[#f5efe4]/50 mb-3">
            <Link 
                href={route('dashboard')} 
                className="flex items-center gap-1 hover:text-white transition-colors"
            >
                <House className="w-3.5 h-3.5 text-[#e98425]" />
                <span>AUTOIN</span>
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <CaretRight className="w-3 h-3 text-[#f5efe4]/30" />
                    {item.href ? (
                        <Link 
                            href={item.href}
                            className="hover:text-white transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-[#f5efe4] font-bold">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
