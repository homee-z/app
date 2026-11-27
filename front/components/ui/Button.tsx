import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    loading?: boolean;
};

const STYLES: Record<Variant, string> = {
    primary: "bg-[#c1622a] text-white hover:bg-[#93481a]",
    outline: "border border-[#e6e2da] bg-white text-[#25291f] hover:bg-[#faf9f6]",
    danger: "bg-[#b23a3a] text-white hover:bg-[#962f2f]",
};

export function Button({
    variant = "primary",
    loading = false,
    type = "button",
    disabled,
    children,
    className = "",
    ...rest
}: ButtonProps) {

    return (
        <button
        type={type}
        disabled={disabled || loading}
        aria-busy={loading}
        className={`rounded-xl px-4.5 py-2.75 text-[13px] font-bold transition-colors disabled:opacity-50 ${STYLES[variant]} ${className}`}
        {...rest}
        >
            {loading ? "…" : children}
        </button>
    );
}