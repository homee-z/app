"use client";

export default function CorveesError({ reset }: {
    reset: () => void;
}) {
    return (
        <div>
            <h1>Une erreur est survenue</h1>
            <button onClick={reset}>réessayer</button>
        </div>
    );
}