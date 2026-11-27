import Link from "next/link";
import type { Metadata } from "next";
import { NotFoundBlobs } from "./_components/not-found-blobs";

export const metadata: Metadata = {
  title: "Page introuvable — Homee'z",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-canvas px-6 py-24">
      <NotFoundBlobs />

      <div className="relative flex max-w-md flex-col items-center gap-3 text-center">
        <p
          aria-hidden="true"
          className="font-heading text-8xl font-extrabold text-brand"
        >
          404
        </p>
        <h1 className="font-heading text-2xl font-extrabold text-ink">
          Cette page a coulé quelque part
        </h1>
        <p className="text-sm text-muted">
          Bougez la souris — et retournez plutôt à l&apos;accueil.
        </p>
        <Link
          href="/"
          className="mt-3 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}