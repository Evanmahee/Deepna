import Link from "next/link";
import {
  BarChart2,
  CalendarCheck,
  Clock,
  Sparkles,
} from "lucide-react";

const features = [
  {
    Icon: CalendarCheck,
    title: "Habitudes quotidiennes",
    description:
      "Structure ta journée par créneaux et suis tes habitudes en un geste.",
  },
  {
    Icon: Sparkles,
    title: "Identité 3-6-9",
    description:
      "Ancre qui tu veux devenir avec des rappels matin, après-midi et soir.",
  },
  {
    Icon: Clock,
    title: "Check-in horaire",
    description:
      "Note ce que tu fais chaque heure et reste conscient de ton temps.",
  },
  {
    Icon: BarChart2,
    title: "Statistiques",
    description:
      "Visualise ta progression, tes séries et ton taux de complétion.",
  },
] as const;

const steps = [
  "Crée tes habitudes",
  "Valide chaque jour",
  "Deviens qui tu veux être",
] as const;

export function LandingPage() {
  return (
    <div className="min-h-full text-slate-900">
      <section className="landing-hero mx-auto max-w-3xl px-4 pb-16 pt-20 text-center">
        <h1 className="landing-fade text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          Deepna
        </h1>
        <p className="landing-fade landing-fade-delay-1 mx-auto mt-4 max-w-md text-lg text-slate-600">
          Deviens la personne que tu veux être.
        </p>
        <Link
          href="/login"
          className="landing-fade landing-fade-delay-2 mt-8 inline-block rounded-xl bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-neutral-900/15 transition hover:bg-neutral-800"
        >
          Commencer gratuitement
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="landing-scroll-fade mb-8 text-center text-2xl font-semibold text-slate-900">
          Tout ce qu&apos;il te faut
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ Icon, title, description }, i) => (
            <article
              key={title}
              className="landing-scroll-fade glass rounded-2xl p-5 shadow-sm"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Icon className="mb-3 h-8 w-8 text-neutral-900" strokeWidth={1.8} />
              <h3 className="font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="landing-scroll-fade mb-10 text-center text-2xl font-semibold text-slate-900">
          Comment ça marche
        </h2>
        <ol className="space-y-6">
          {steps.map((step, i) => (
            <li
              key={step}
              className="landing-scroll-fade flex items-start gap-4"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="glass-pill flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-neutral-900">
                {i + 1}
              </span>
              <p className="pt-2 text-lg text-slate-700">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="glass-bar px-4 py-8 text-center text-sm text-slate-500">
        <p>Deepna © 2026</p>
        <p className="mt-2 flex justify-center gap-4">
          <Link href="/legal/privacy" className="text-slate-500 hover:text-slate-800">
            Confidentialité
          </Link>
          <Link href="/legal/terms" className="text-slate-500 hover:text-slate-800">
            CGU
          </Link>
        </p>
      </footer>
    </div>
  );
}
