import { X, Warning, Check, Info, Trash } from '@phosphor-icons/react';

export default function ConfirmModal({
    isOpen = false,
    title = 'Konfirmasi Tindakan',
    message = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
    confirmText = 'Oke',
    cancelText = 'Batal',
    onConfirm,
    onCancel,
    type = 'info', // info, warning, danger, success
}) {
    
    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: Trash,
                    iconBg: 'bg-[#ff6b3d]/10 border-[#ff6b3d]/20 text-[#ff6b3d]',
                    confirmBtn: 'bg-[#ff6b3d] text-[#1a1714] shadow-[0_4px_15px_rgba(255,107,61,0.2)]',
                };
            case 'warning':
                return {
                    icon: Warning,
                    iconBg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
                    confirmBtn: 'bg-yellow-500 text-[#1a1714] shadow-[0_4px_15px_rgba(234,179,8,0.2)]',
                };
            case 'success':
                return {
                    icon: Check,
                    iconBg: 'bg-[#6cba5b]/10 border-[#6cba5b]/20 text-[#6cba5b]',
                    confirmBtn: 'bg-[#6cba5b] text-[#1a1714] shadow-[0_4px_15px_rgba(108,186,91,0.2)]',
                };
            default: // info
                return {
                    icon: Info,
                    iconBg: 'bg-[#e98425]/15 border-[#e98425]/20 text-[#e98425]',
                    confirmBtn: 'bg-[#e98425] text-[#1a1714] shadow-[0_4px_15px_rgba(233,132,37,0.2)]',
                };
        }
    };

    if (!isOpen) return null;

    const styles = getTypeStyles();
    const IconComponent = styles.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur Overlay */}
            <div 
                onClick={onCancel}
                className="absolute inset-0 bg-[#0e0d0c]/85 backdrop-blur-sm transition-opacity"
            />

            {/* Modal Card */}
            <div className="relative bg-[#1a1714] border border-[#ebe6dd]/10 rounded-[24px] max-w-sm w-full p-7 shadow-[0_15px_50px_rgba(0,0,0,0.6)] flex flex-col gap-5 z-10 animate-in fade-in zoom-in-95 duration-200">
                {/* Header Icon & Close */}
                <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${styles.iconBg}`}>
                        <IconComponent className="w-5 h-5" weight="bold" />
                    </div>
                    <button 
                        onClick={onCancel}
                        className="p-1 rounded-lg hover:bg-white/5 text-[#f5efe4]/40 hover:text-white transition-all cursor-pointer"
                    >
                        <X className="w-4 h-4" weight="bold" />
                    </button>
                </div>

                {/* Title & Message */}
                <div>
                    <h3 className="font-extrabold text-lg text-white leading-tight">
                        {title}
                    </h3>
                    <p className="text-xs text-[#f5efe4]/60 leading-relaxed mt-2.5">
                        {message}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-2">
                    <button 
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-white font-semibold rounded-full transition-all text-xs font-mono uppercase tracking-widest cursor-pointer text-center active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button 
                        type="button"
                        onClick={onConfirm}
                        className={`flex-1 py-3 font-bold rounded-full hover:scale-[1.02] active:scale-[0.97] transition-all duration-200 text-xs font-mono uppercase tracking-widest cursor-pointer text-center ${styles.confirmBtn}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
