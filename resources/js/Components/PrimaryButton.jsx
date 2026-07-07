export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `w-full py-3 px-6 bg-[#e98425] hover:scale-[1.02] active:scale-[0.97] text-[#1a1714] font-bold text-xs uppercase tracking-widest rounded-full transition-all duration-200 shadow-[0_4px_20px_rgba(233,132,37,0.15)] flex items-center justify-center gap-2 cursor-pointer font-mono ${
                    disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
