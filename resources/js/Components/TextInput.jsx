import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#e98425] focus:ring-1 focus:ring-[#e98425] text-white rounded-xl py-2.5 px-4 outline-none text-sm transition-all font-mono ' +
                className
            }
            ref={localRef}
        />
    );
});
