import Link from "next/link";
import { addDaysUtc } from "@/lib/dates";

type DateStripProps = {
  selectedDate: string;
};

const dayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

export function DateStrip({ selectedDate }: DateStripProps) {
  const slots: string[] = [];
  for (let i = -7; i <= 7; i++) {
    slots.push(addDaysUtc(selectedDate, i));
  }

  return (
    <div className="sticky top-0 z-10 border-b border-[#222] bg-[#0a0a0f]/95 backdrop-blur">
      <div className="scrollbar-hide flex gap-1.5 overflow-x-auto px-2 py-2 sm:gap-2 sm:px-3 sm:py-3">
        {slots.map((iso) => {
          const d = new Date(Date.parse(`${iso}T12:00:00.000Z`));
          const label = dayLabels[d.getUTCDay()];
          const num = d.getUTCDate();
          const active = iso === selectedDate;
          return (
            <Link
              key={iso}
              href={`/?date=${iso}`}
              scroll={false}
              className={`flex min-w-[44px] flex-col items-center rounded-lg px-1.5 py-1.5 text-[10px] transition-colors sm:min-w-[52px] sm:rounded-xl sm:px-2 sm:py-2 sm:text-xs ${
                active
                  ? "bg-[#6366f1] text-white shadow-lg shadow-indigo-900/40"
                  : "text-zinc-400 hover:bg-[#161616] hover:text-white"
              }`}
            >
              <span className="font-medium">{label}</span>
              <span
                className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  active ? "bg-white/20" : "bg-[#111]"
                }`}
              >
                {num}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
