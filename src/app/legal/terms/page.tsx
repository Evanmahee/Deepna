import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions générales — Deepna",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 pb-28 text-slate-700">
      <Link href="/" className="text-sm text-neutral-900 hover:underline">
        ← Retour
      </Link>
      <h1 className="mt-6 text-2xl font-semibold text-slate-900">
        Conditions générales d&apos;utilisation
      </h1>
      <p className="mt-2 text-sm text-slate-500">Dernière mise à jour : juin 2026</p>

      <section className="mt-8 space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-medium text-slate-900">1. Objet</h2>
        <p>
          Les présentes CGU régissent l&apos;accès et l&apos;utilisation de
          l&apos;application Deepna, éditée à des fins de développement
          personnel et de suivi d&apos;habitudes.
        </p>

        <h2 className="text-lg font-medium text-slate-900">2. Compte utilisateur</h2>
        <p>
          Vous êtes responsable de la confidentialité de vos identifiants. Toute
          activité réalisée depuis votre compte est réputée effectuée par vous.
        </p>

        <h2 className="text-lg font-medium text-slate-900">3. Usage acceptable</h2>
        <p>
          Vous vous engagez à ne pas détourner le service, tenter d&apos;accéder
          à des données d&apos;autres utilisateurs ni utiliser l&apos;application à
          des fins illégales.
        </p>

        <h2 className="text-lg font-medium text-slate-900">4. Propriété intellectuelle</h2>
        <p>
          Deepna, son interface, son code et sa marque restent la propriété de
          l&apos;éditeur. Vous conservez la propriété du contenu que vous saisissez.
        </p>

        <h2 className="text-lg font-medium text-slate-900">5. Disponibilité</h2>
        <p>
          Le service est fourni « en l&apos;état ». Nous nous efforçons d&apos;assurer
          une disponibilité continue sans garantie d&apos;absence d&apos;interruption.
        </p>

        <h2 className="text-lg font-medium text-slate-900">6. Limitation de responsabilité</h2>
        <p>
          Deepna est un outil d&apos;accompagnement, pas un dispositif médical ou
          thérapeutique. L&apos;éditeur ne saurait être tenu responsable des
          décisions prises sur la base des informations affichées.
        </p>

        <h2 className="text-lg font-medium text-slate-900">7. Résiliation</h2>
        <p>
          Vous pouvez cesser d&apos;utiliser le service à tout moment. Nous pouvons
          suspendre un compte en cas de violation des présentes CGU.
        </p>

        <h2 className="text-lg font-medium text-slate-900">8. Contact</h2>
        <p>
          Questions juridiques :{" "}
          <a href="mailto:contact@deepna.app" className="text-neutral-900">
            contact@deepna.app
          </a>
          .
        </p>
      </section>
    </div>
  );
}
