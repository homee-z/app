"use client";
import { useEffect, useId } from "react";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    title: string;
    icon?: React.ReactNode;
    align?: "left" | "center";
    children: React.ReactNode;
};

export function Modal({ open, onClose, title, icon, align = "left", children }: ModalProps) {
    const titleId = useId();

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const centered = align === "center";

    return (
        <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
        >
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(e) => e.stopPropagation()}
            className={`flex w-full max-w-105 flex-col gap-4 rounded-[20px] bg-white p-6 shadow-xl ${
            centered ? "items-center text-center" : ""
            }`}
        >
            {icon}
            <h2 id={titleId} className="font-display text-[17px] font-extrabold text-[#20241b]">
            {title}
            </h2>
            {children}
        </div>
        </div>
    );
}