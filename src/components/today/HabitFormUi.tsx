"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

/** Conteneur d’icône formulaire — DA noir & blanc. */
export const formIconBoxClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white";

export function FormIconBox({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`${formIconBoxClass} ${className}`.trim()}>{children}</span>
  );
}

export function FormSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-5">
      {title ? (
        <h3 className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
          {title}
        </h3>
      ) : null}
      <div className="glass-dark-subtle divide-y divide-white/[0.06] overflow-hidden rounded-2xl">
        {children}
      </div>
    </section>
  );
}

type FormRowProps = {
  icon: ReactNode;
  label: string;
  value?: string;
  valueMuted?: boolean;
  onClick?: () => void;
  showChevron?: boolean;
  bareIcon?: boolean;
  children?: ReactNode;
};

export function FormRow({
  icon,
  label,
  value,
  valueMuted = false,
  onClick,
  showChevron = true,
  bareIcon = false,
  children,
}: FormRowProps) {
  const interactive = Boolean(onClick);
  const Tag = interactive ? "button" : "div";

  return (
    <Tag
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-3 py-3 text-left transition-colors ${
        interactive ? "hover:bg-white/[0.04] active:bg-white/[0.06]" : ""
      }`}
    >
      {bareIcon ? icon : <span className={formIconBoxClass}>{icon}</span>}
      <span className="min-w-0 flex-1 text-base text-white">{label}</span>
      {children ?? (
        <span
          className={`max-w-[45%] truncate text-sm ${
            valueMuted || !value ? "text-neutral-500" : "text-neutral-400"
          }`}
        >
          {value ?? ""}
        </span>
      )}
      {showChevron && interactive ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-600" strokeWidth={2} />
      ) : null}
    </Tag>
  );
}

export function FormNameCard({
  value,
  onChange,
  maxLength = 100,
  placeholder = "Nom de l'habitude",
}: {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  placeholder?: string;
}) {
  return (
    <div className="glass-dark-subtle mb-5 overflow-hidden rounded-2xl px-3 py-3">
      <div className="flex items-start gap-3">
        <FormIconBox className="mt-0.5">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </FormIconBox>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs text-neutral-500">Nom</p>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
            placeholder={placeholder}
            className="w-full bg-transparent text-base text-white placeholder:text-neutral-600 focus:outline-none"
            maxLength={maxLength}
          />
        </div>
      </div>
      <p className="mt-2 text-right text-[11px] tabular-nums text-neutral-600">
        {value.length}/{maxLength}
      </p>
    </div>
  );
}

export function SheetHeader({
  title,
  onLeft,
  leftLabel,
  onRight,
  rightDisabled,
  rightLoading,
}: {
  title: string;
  onLeft: () => void;
  leftLabel: string;
  onRight?: () => void;
  rightDisabled?: boolean;
  rightLoading?: boolean;
}) {
  return (
    <header className="grid shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center px-4 pb-3 pt-3">
      <button
        type="button"
        onClick={onLeft}
        className="glass-dark flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 active:scale-95"
        aria-label={leftLabel}
      >
        {leftLabel === "Retour" ? (
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        )}
      </button>
      <h2 className="truncate text-center text-lg font-semibold text-white">{title}</h2>
      {onRight ? (
        <button
          type="button"
          disabled={rightDisabled || rightLoading}
          onClick={onRight}
          className="glass-primary flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:opacity-90 disabled:opacity-40 active:scale-95"
          aria-label="Enregistrer"
        >
          {rightLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </button>
      ) : (
        <span aria-hidden className="h-11 w-11" />
      )}
    </header>
  );
}

export function IosSwitch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-state={checked ? "on" : "off"}
      onClick={() => onChange(!checked)}
      className="ios-switch"
    >
      <span className="ios-switch-thumb" aria-hidden />
    </button>
  );
}
