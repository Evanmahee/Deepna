import Link from "next/link";

type PageHeaderProps = {
  title: string;
  subtitle?: string | null;
  /** Prénom affiché en haut à droite */
  firstName?: string | null;
  /** Ligne type « Bonjour X 👋 » sous le titre */
  greeting?: string | null;
};

export function PageHeader({
  title,
  subtitle,
  firstName,
  greeting,
}: PageHeaderProps) {
  return (
    <header className="border-b border-[#222] px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {greeting ? (
            <p className="mt-1 text-sm text-zinc-300">{greeting}</p>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
        {firstName ? (
          <Link
            href="/settings"
            className="shrink-0 rounded-lg bg-[#6366f1]/10 px-3 py-1 text-sm font-medium text-[#a5b4fc] hover:bg-[#6366f1]/20"
          >
            {firstName}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
