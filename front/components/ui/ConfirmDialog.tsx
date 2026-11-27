"use client";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
};

function TrashIcon() {
    return (
        <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        >
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M6 6l1 14h10l1-14" />
        <path d="M10 11v6M14 11v6" />
        </svg>
    );
}

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = "Confirmer",
    danger = false,
    loading = false,
    icon,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    // Pas de fermeture (Échap, fond, Annuler) tant que l'action tourne
    const handleCancel = () => {
        if (!loading) onCancel();
    };

    const shownIcon = icon ?? (danger ? <TrashIcon /> : null);

    return (
        <Modal
        open={open}
        onClose={handleCancel}
        title={title}
        align="center"
        icon={
            shownIcon && (
            <span
                className={`flex size-10 items-center justify-center rounded-full ${
                danger ? "bg-[#f6e3e3] text-[#b23a3a]" : "bg-[#f7e7dc] text-[#c1622a]"
                }`}
            >
                {shownIcon}
            </span>
            )
        }
        >
            <p className="text-[13.5px] text-[#6b6459]">{message}</p>
            <div className="flex w-full gap-2.5">
                <Button className="flex-1" variant="outline" onClick={handleCancel} disabled={loading}>
                Annuler
                </Button>
                <Button
                className="flex-1"
                variant={danger ? "danger" : "primary"}
                onClick={onConfirm}
                loading={loading}
                >
                {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
}