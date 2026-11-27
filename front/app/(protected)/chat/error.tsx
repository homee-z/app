"use client";

export default function ChatError({ reset }: {
    reset: () => void;
}) {
    return (
        <div>
            <h1>Une erreur est survenue</h1>
            <button onClick={reset}>réessayer</button>
        </div>
    );
}