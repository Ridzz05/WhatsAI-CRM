export default function Card({
    title,
    subtitle,
    color = 'dark', // dark, peach, mint, yellow, blue, pink
    action,
    children,
    className = '',
    ...props
}) {
    
    const getColorStyles = () => {
        switch (color) {
            case 'peach':
                return 'bg-[#ffe1d9] text-[#1a1714]';
            case 'mint':
                return 'bg-[#d2eecb] text-[#1a1714]';
            case 'yellow':
                return 'bg-[#ffe9bf] text-[#1a1714]';
            case 'blue':
                return 'bg-[#d6e7ff] text-[#1a1714]';
            case 'pink':
                return 'bg-[#ffd6f1] text-[#1a1714]';
            default: // dark
                return 'bg-[#1a1714] border border-[#ebe6dd]/10 text-[#f5efe4]';
        }
    };

    const isLightText = color === 'dark';

    return (
        <div 
            {...props}
            className={`rounded-[24px] p-6 transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${getColorStyles()} ${className}`}
        >
            <div>
                {(title || subtitle || action) && (
                    <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0">
                            {title && (
                                <span className={`text-[10px] font-bold font-mono uppercase tracking-widest block ${
                                    isLightText ? 'text-[#f5efe4]/40' : 'text-[#1a1714]/60'
                                }`}>
                                    {title}
                                </span>
                            )}
                            {subtitle && (
                                <h3 className={`font-extrabold text-base leading-tight mt-1 truncate ${
                                    isLightText ? 'text-white' : 'text-[#1a1714]'
                                }`}>
                                    {subtitle}
                                </h3>
                            )}
                        </div>
                        {action && (
                            <div className="shrink-0 ml-4">
                                {action}
                            </div>
                        )}
                    </div>
                )}

                <div className="w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}
