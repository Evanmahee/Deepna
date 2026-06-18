import { HeaderActions } from "@/components/nav/HeaderActions";
import { HeaderOrganizeButton } from "@/components/nav/HeaderOrganizeButton";

type PageHeaderProps = {
  title: string;
  subtitle?: string | null;
  greeting?: string | null;
  showAdd?: boolean;
  showOrganize?: boolean;
  centerTitle?: boolean;
};

export function PageHeader({
  title,
  subtitle,
  greeting,
  showAdd = false,
  showOrganize = false,
  centerTitle = false,
}: PageHeaderProps) {
  if (centerTitle) {
    return (
      <header className="glass-bar px-4 py-3">
        <div className="relative flex h-9 items-center justify-between">
          <div className="relative z-10 shrink-0">
            {showOrganize ? (
              <HeaderOrganizeButton />
            ) : (
              <span className="inline-block h-9 w-9" aria-hidden />
            )}
          </div>
          <h1 className="pointer-events-none absolute inset-x-0 text-center text-xl font-semibold leading-9 text-white">
            {title}
          </h1>
          <div className="relative z-10 shrink-0">
            {showAdd ? (
              <HeaderActions showSearch={false} />
            ) : (
              <span className="inline-block h-9 w-9" aria-hidden />
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="glass-bar px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {greeting ? (
            <p className="mt-1 text-sm text-neutral-400">{greeting}</p>
          ) : null}
          {subtitle ? (
            <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
          ) : null}
        </div>
        {showAdd ? <HeaderActions showSearch={false} /> : null}
      </div>
    </header>
  );
}
