import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — Homee'z",
  description: "Conditions générales d'utilisation de l'application Homee'z.",
};

export default function CguPage() {
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
            Conditions générales d&apos;utilisation
          </h1>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              1. Objet
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Les présentes conditions générales d&apos;utilisation (CGU)
              régissent l&apos;accès et l&apos;utilisation du service homeez,
              une application permettant à un foyer de gérer collectivement
              ses corvées, ses listes de courses, son calendrier, son budget
              et ses échanges. Elles s&apos;appliquent à tout utilisateur
              créant un compte sur l&apos;application.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              2. Acceptation des conditions
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              La création d&apos;un compte sur homeez implique
              l&apos;acceptation pleine et entière des présentes CGU. Si vous
              n&apos;acceptez pas tout ou partie de ces conditions, vous ne
              devez pas utiliser le service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              3. Accès au service et création de compte
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              L&apos;accès à homeez nécessite la création d&apos;un compte
              personnel, puis la création ou l&apos;adhésion à un foyer via
              un code d&apos;invitation. Chaque utilisateur est responsable
              de la confidentialité de ses identifiants et de l&apos;ensemble
              des actions effectuées depuis son compte.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              4. Rôles au sein d&apos;un foyer
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Un foyer comprend un ou plusieurs membres, répartis selon
              trois rôles : administrateur (créateur du foyer, qui peut
              gérer les membres et les paramètres du foyer), membre (accès
              complet aux fonctionnalités du foyer) et invité (accès en
              lecture seule). L&apos;administrateur est responsable de la
              gestion des membres de son foyer.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              5. Obligations de l&apos;utilisateur
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              L&apos;utilisateur s&apos;engage à fournir des informations
              exactes lors de son inscription, à ne pas utiliser le service
              à des fins illicites, et à ne pas porter atteinte au bon
              fonctionnement de l&apos;application ou aux droits des autres
              utilisateurs.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              6. Propriété intellectuelle
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              L&apos;ensemble des éléments du service (interface, logo,
              textes, code source) reste la propriété de ses auteurs. Les
              contenus ajoutés par les utilisateurs (corvées, messages,
              listes, lignes budgétaires) leur appartiennent et ne sont
              utilisés par homeez que pour le fonctionnement du service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              7. Disponibilité du service
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              homeez est un projet développé dans un cadre académique et
              fourni « en l&apos;état », sans garantie de disponibilité
              continue. Des interruptions, notamment pour maintenance,
              peuvent survenir sans préavis.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              8. Responsabilité
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              homeez ne saurait être tenu responsable des dommages directs
              ou indirects résultant de l&apos;utilisation ou de
              l&apos;impossibilité d&apos;utiliser le service, ni du contenu
              publié par les utilisateurs au sein de leur foyer.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              9. Données personnelles
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Le traitement des données personnelles est décrit dans notre{" "}
              <Link
                href="/politique-cookies"
                className="font-semibold text-ink underline"
              >
                politique de cookies
              </Link>
              . Conformément au RGPD, chaque utilisateur peut demander
              l&apos;accès, la rectification ou la suppression de ses
              données en nous contactant.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              10. Modification des CGU
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Ces CGU peuvent être modifiées à tout moment. La version en
              vigueur est celle publiée sur cette page.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              11. Droit applicable
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Les présentes CGU sont soumises au droit français.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-bold text-ink">
              12. Contact
            </h2>
            <p className="text-[14.5px] leading-6 text-muted">
              Pour toute question relative aux présentes CGU, vous pouvez
              nous écrire à [email de contact].
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}