export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-[10px] uppercase font-mono tracking-widest text-[#f5efe4]/50 mb-1.5 ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
