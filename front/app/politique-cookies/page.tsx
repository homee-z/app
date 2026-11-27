import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de cookies — Homee'z",
  description: "Politique de cookies de l'application Homee'z.",
};

export default function PolitiqueCookiesPage() {
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
            Politique de cookies
          </h1>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              Qu&apos;est-ce qu&apos;un cookie ?
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Un cookie est un petit fichier déposé sur votre appareil lors
              de votre navigation. Il permet notamment de vous reconnaître
              d&apos;une page à l&apos;autre et de conserver certaines
              informations entre vos visites.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              Les cookies utilisés par homeez
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              homeez utilise uniquement des cookies strictement nécessaires
              au fonctionnement du service, qui ne requièrent pas votre
              consentement préalable :
            </p>
            <ul className="list-disc pl-5 text-[14.5px] leading-6 text-muted">
              <li>
                un cookie d&apos;authentification, qui vous maintient
                connecté entre deux visites ;
              </li>
              <li>
                un cookie indiquant le foyer actif, pour vous présenter les
                bonnes données dès votre arrivée sur l&apos;application.
              </li>
            </ul>
            <p className="text-[14.5px] leading-6 text-muted">
              Aucun cookie de mesure d&apos;audience ou publicitaire
              n&apos;est déposé à ce jour. Si un outil d&apos;analyse
              d&apos;audience respectueux de la vie privée venait à être mis
              en place, cette page serait mise à jour en conséquence.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              Durée de conservation
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Le cookie d&apos;authentification est conservé pour la durée
              de votre session, renouvelée automatiquement tant que vous
              restez actif. Le cookie de foyer actif est conservé jusqu&apos;à
              votre déconnexion ou votre changement de foyer.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              Gestion des cookies
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Ces cookies étant strictement nécessaires au fonctionnement du
              service, ils ne peuvent pas être désactivés depuis
              l&apos;application : les désactiver depuis votre navigateur
              vous empêchera de rester connecté. Vous pouvez à tout moment
              supprimer les cookies déjà déposés depuis les paramètres de
              votre navigateur.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              Contact
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Pour toute question relative à cette politique, vous pouvez
              nous écrire à [email de contact].
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}