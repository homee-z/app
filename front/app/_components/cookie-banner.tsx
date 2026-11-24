"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "homeez-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setVisible(true);
      }
    } catch {
      // localStorage indisponible (navigation privée, etc.) : on affiche quand même le bandeau
      setVisible(true);
    }
  }, []);

  const acknowledge = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "acknowledged");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-[640px] flex-col gap-3 rounded-2xl bg-ink px-5 py-4 text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13.5px] leading-5 text-white/90">
          homeez utilise uniquement des cookies strictement nécessaires au
          fonctionnement du service (connexion, foyer actif). En savoir plus
          dans notre{" "}
          <Link href="/politique-cookies" className="font-semibold underline">
            politique de cookies
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={acknowledge}
          className="shrink-0 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-ink hover:opacity-90"
        >
          J&apos;ai compris
        </button>
      </div>
    </div>
  );
}