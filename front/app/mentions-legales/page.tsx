import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales — Homee'z",
  description: "Mentions légales de l'application Homee'z.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="flex-1 bg-background px-6 py-12">
      <div className="mx-auto flex max-w-[712px] flex-col gap-10">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="font-heading text-xl font-extrabold text-ink"
          >
            home<span className="text-brand">ez</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold text-ink hover:underline"
          >
            Retour
          </Link>
        </header>

        <div className="flex flex-col gap-8">
          <h1 className="font-heading text-[32px] font-extrabold text-ink">
            Mentions légales
          </h1>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              Éditeur du site
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Le service homeez est édité par [Raison sociale], [forme
              juridique] au capital de [montant] €, immatriculée au RCS de
              [ville] sous le numéro [SIRET], dont le siège social est situé
              [adresse]. Numéro de TVA intracommunautaire : [numéro].
              Directeur de la publication : [nom].
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              Hébergement
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Le site est hébergé par [nom de l&apos;hébergeur], [adresse de
              l&apos;hébergeur].
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              Propriété intellectuelle
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              L&apos;ensemble des contenus (textes, logos, interfaces)
              présents sur homeez sont protégés par le droit de la propriété
              intellectuelle. Toute reproduction sans autorisation préalable
              est interdite.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              Contact
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Pour toute question, vous pouvez nous écrire à [email de
              contact].
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}