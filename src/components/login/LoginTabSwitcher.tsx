"use client";

type Mode = "signin" | "signup";

type LoginTabSwitcherProps = {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
};

export function LoginTabSwitcher({ mode, onModeChange }: LoginTabSwitcherProps) {
  const tabClass = (active: boolean) =>
    [
      "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-indigo-600 text-white"
        : "text-zinc-400 hover:text-white",
    ].join(" ");

  return (
    <div
      className="flex gap-1 rounded-lg border border-[#333] bg-[#111] p-1"
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
