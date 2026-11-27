"use client";
import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";

export default function Budget() {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    function confirm() {
        setLoading(true);
        setTimeout(() => { setLoading(false); setOpen(false); }, 2000);
    }

    return(
        <div>
            <h1>budget</h1>
            <Button variant="danger" onClick={() => setOpen(true)}>Supprimer</Button>
            <ConfirmDialog
                open={open}
                title="Supprimer la corvée ?"
                message="Cette action est définitive."
                confirmLabel="Supprimer"
                danger
                loading={loading}
                onConfirm={confirm}
                onCancel={() => setOpen(false)}
            />
        </div>
    )
}