import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Homee'z — Toute la famille, un seul endroit",
  description:
    "Calendrier, tâches, courses et budget : homeez rassemble le quotidien de votre foyer dans une appli simple et rassurante.",
};

function IconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
      {children}
    </span>
  );
}

const features: { title: string; icon: ReactNode }[] = [
  {
    title: "Calendrier familial",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    title: "Répartition des tâches",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Listes de courses",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    title: "Budget du foyer",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <path d="M2 10h20M16 14h.01" />
      </svg>
    ),
  },
  {
    title: "Rappels",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
  },
  {
    title: "Messagerie familiale",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
      </svg>
    ),
  },
];

export default function HomePage() {
  return (
    <main className="bg-background">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-6 px-6 py-6">
        <Link href="/" className="font-heading text-xl font-extrabold text-ink">
          home<span className="text-brand">ez</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-ink hover:underline">
            Se connecter
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:opacity-90"
          >
            S&apos;inscrire
          </Link>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-[1200px] px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="flex max-w-[480px] flex-col gap-6">
            <h1 className="font-heading text-4xl font-extrabold leading-[1.1] text-ink md:text-5xl">
              Toute la famille, <span className="text-brand">un seul endroit</span> pour s&apos;organiser.
            </h1>
            <p className="text-lg leading-relaxed text-muted">
              Calendrier, tâches, courses et budget : homeez rassemble le quotidien de votre foyer dans une appli
              simple et rassurante.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-brand px-7 py-3.5 text-sm font-bold text-white hover:opacity-90"
              >
                Créer un compte
              </Link>
              <a href="#fonctionnalites" className="text-sm font-bold text-ink hover:underline">
                Découvrir les fonctionnalités →
              </a>
            </div>
          </div>

          <div aria-hidden="true" className="relative mx-auto h-[300px] w-[300px] md:h-[360px] md:w-[360px]">
            <div className="absolute -right-6 -top-10 h-24 w-24 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-brand-soft/70" />
            <div className="absolute inset-0 rounded-full bg-brand-soft/60" />
            <div className="absolute inset-[18%] rounded-full bg-brand-soft" />
            <div className="absolute inset-[38%] rounded-full bg-brand" />
          </div>
        </div>
      </section>

      <section id="fonctionnalites" className="mx-auto w-full max-w-[1200px] px-6 py-16">
        <div className="flex flex-col gap-2">
          <h2 className="font-heading text-[28px] font-extrabold text-ink md:text-[38px]">
            Tout ce qu&apos;il faut pour souffler un peu.
          </h2>
          <p className="text-base text-muted">Six essentiels du quotidien familial, réunis au même endroit.</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative flex h-[260px] flex-col justify-between overflow-hidden rounded-3xl bg-brand-soft/40 p-5 lg:h-[400px]"
            >
              <IconBadge>{feature.icon}</IconBadge>
              <span className="font-heading text-base font-extrabold text-ink">{feature.title}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand px-8 py-10 text-white md:flex-row md:items-center">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-2xl font-extrabold md:text-[32px]">Prêts à souffler un peu ?</h2>
            <p className="max-w-[420px] text-[15px] text-white/90">
              Créez votre compte, ajoutez votre famille en quelques minutes.
            </p>
          </div>
          <Link
            href="/register"
            className="rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-brand hover:opacity-90"
          >
            Créer un compte
          </Link>
        </div>
      </section>

      <footer className="mx-auto mt-16 flex w-full max-w-[1200px] flex-col gap-6 border-t border-[#ECE8E0] px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-[260px] flex-col gap-2.5">
          <Link href="/" className="font-heading text-lg font-extrabold text-ink">
            home<span className="text-brand">ez</span>
          </Link>
          <p className="text-[13.5px] text-muted">La vie de famille, simplifiée au quotidien.</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/mentions-legales" className="text-[13.5px] font-semibold text-ink hover:underline">
            Mentions légales
          </Link>
          <Link href="/cgu" className="text-[13.5px] font-semibold text-ink hover:underline">
            CGU
          </Link>
          <Link href="/politique-cookies" className="text-[13.5px] font-semibold text-ink hover:underline">
            Politique de cookies
          </Link>
        </nav>

        <p className="text-xs text-muted">© 2026 homeez. Tous droits réservés.</p>
      </footer>
    </main>
  );
}