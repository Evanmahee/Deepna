import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Deepna",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 pb-28 text-zinc-300">
      <Link href="/" className="text-sm text-[#6366f1] hover:underline">
        ← Retour
      </Link>
      <h1 className="mt-6 text-2xl font-semibold text-white">
        Politique de confidentialité
      </h1>
      <p className="mt-2 text-sm text-zinc-500">Dernière mise à jour : juin 2026</p>

      <section className="mt-8 space-y-4 text-sm leading-relaxed">
        <h2 className="text-lg font-medium text-white">1. Responsable du traitement</h2>
        <p>
          Deepna (« nous ») traite vos données personnelles dans le cadre de
          l&apos;application de suivi d&apos;habitudes et de développement
          personnel.
        </p>

        <h2 className="text-lg font-medium text-white">2. Données collectées</h2>
        <p>Nous pouvons collecter :</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Identifiants de compte (e-mail, nom d&apos;affichage)</li>
          <li>Données d&apos;usage (habitudes, check-ins, objectifs, statistiques)</li>
          <li>Données techniques (cookies de session, abonnements push le cas échéant)</li>
        </ul>

        <h2 className="text-lg font-medium text-white">3. Finalités</h2>
        <p>
          Vos données servent à fournir le service, personnaliser votre
          expérience, synchroniser vos contenus entre appareils et, avec votre
          consentement, envoyer des notifications.
        </p>

        <h2 className="text-lg font-medium text-white">4. Base légale (RGPD)</h2>
        <p>
          Le traitement repose sur l&apos;exécution du contrat (utilisation de
          l&apos;app), votre consentement (notifications, OAuth) et notre intérêt
          légitime (sécurité, amélioration du service).
        </p>

        <h2 className="text-lg font-medium text-white">5. Conservation</h2>
        <p>
          Les données sont conservées tant que votre compte est actif, puis
          supprimées ou anonymisées dans un délai raisonnable après suppression
          du compte.
        </p>

        <h2 className="text-lg font-medium text-white">6. Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez des droits d&apos;accès, de
          rectification, d&apos;effacement, de limitation, de portabilité et
          d&apos;opposition. Pour les exercer :{" "}
          <a href="mailto:contact@deepna.app" className="text-[#6366f1]">
            contact@deepna.app
          </a>
          .
        </p>

        <h2 className="text-lg font-medium text-white">7. Sous-traitants</h2>
        <p>
          L&apos;hébergement et l&apos;authentification peuvent faire appel à
          des prestataires (ex. Supabase, Google OAuth) situés dans l&apos;UE ou
          aux États-Unis avec garanties appropriées.
        </p>
      </section>
    </div>
  );
}
