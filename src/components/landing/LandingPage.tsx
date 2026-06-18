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
    <div className="min-h-full bg-[#0a0a0f] text-white">
      <section className="landing-hero mx-auto max-w-3xl px-4 pb-16 pt-20 text-center">
        <h1 className="landing-fade text-5xl font-bold tracking-tight sm:text-6xl">
          Deepna
        </h1>
        <p className="landing-fade landing-fade-delay-1 mx-auto mt-4 max-w-md text-lg text-zinc-400">
          Deviens la personne que tu veux être.
        </p>
        <Link
          href="/login"
          className="landing-fade landing-fade-delay-2 mt-8 inline-block rounded-xl bg-[#6366f1] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-[#5558e3]"
        >
          Commencer gratuitement
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="landing-scroll-fade mb-8 text-center text-2xl font-semibold">
          Tout ce qu&apos;il te faut
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map(({ Icon, title, description }, i) => (
            <article
              key={title}
              className="landing-scroll-fade rounded-2xl border border-[#333] bg-[#111] p-5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Icon className="mb-3 h-8 w-8 text-[#6366f1]" strokeWidth={1.8} />
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="landing-scroll-fade mb-10 text-center text-2xl font-semibold">
          Comment ça marche
        </h2>
        <ol className="space-y-6">
          {steps.map((step, i) => (
            <li
              key={step}
              className="landing-scroll-fade flex items-start gap-4"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6366f1]/20 text-sm font-bold text-[#a5b4fc]">
                {i + 1}
              </span>
              <p className="pt-2 text-lg text-zinc-300">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-[#222] px-4 py-8 text-center text-sm text-zinc-500">
        <p>Deepna © 2026</p>
        <p className="mt-2 flex justify-center gap-4">
          <Link href="/legal/privacy" className="text-zinc-500 hover:text-zinc-300">
            Confidentialité
          </Link>
          <Link href="/legal/terms" className="text-zinc-500 hover:text-zinc-300">
            CGU
          </Link>
        </p>
      </footer>
    </div>
  );
}
