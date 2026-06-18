import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bienvenue — Deepna",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-[#0a0a0f] [&_a]:text-neutral-500 [&_a:hover]:text-neutral-300">
      {children}
    </div>
  );
}
