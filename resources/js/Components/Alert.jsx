import { CheckCircle, Warning, Info, ShieldCheck, XCircle, X } from '@phosphor-icons/react';

export default function Alert({ type = 'info', title, message, onClose }) {
    const config = {
        success: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            text: 'text-emerald-400',
            icon: CheckCircle
        },
        error: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            text: 'text-red-400',
            icon: XCircle
        },
        warning: {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            text: 'text-amber-400',
            icon: Warning
        },
        protected: {
            bg: 'bg-[#e98425]/10',
            border: 'border-[#e98425]/20',
            text: 'text-[#e98425]',
            icon: ShieldCheck
        },
        info: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            text: 'text-blue-400',
            icon: Info
        }
    };

    const style = config[type] || config.info;
    const Icon = style.icon;

    return (
        <div className={`p-4 rounded-xl border ${style.bg} ${style.border} flex items-start gap-3 relative transition-all`}>
            <Icon className={`w-5 h-5 ${style.text} shrink-0 mt-0.5`} />
            <div className="flex-1 pr-6">
                {title && <h4 className={`text-xs font-extrabold uppercase tracking-wider ${style.text} mb-0.5`}>{title}</h4>}
                <p className="text-xs text-white/80 leading-relaxed font-sans">{message}</p>
            </div>
            {onClose && (
                <button 
                    onClick={onClose}
                    className="absolute top-3.5 right-3 text-[#f5efe4]/40 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
