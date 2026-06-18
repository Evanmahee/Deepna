"use client";

type Mode = "signin" | "signup";

type LoginTabSwitcherProps = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export function LoginTabSwitcher({ mode, onModeChange }: LoginTabSwitcherProps) {
  const tabClass = (active: boolean) =>
    [
      "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
      active
        ? "bg-neutral-900 text-white shadow-sm"
        : "text-slate-500 hover:text-slate-800",
    ].join(" ");

  return (
    <div
      className="glass flex gap-1 rounded-xl p-1 shadow-sm"
      role="tablist"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "signin"}
        className={tabClass(mode === "signin")}
        onClick={() => onModeChange("signin")}
      >
        Connexion
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "signup"}
        className={tabClass(mode === "signup")}
        onClick={() => onModeChange("signup")}
      >
        Inscription
      </button>
    </div>
  );
}
