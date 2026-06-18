import { describe, expect, it } from "vitest";
import {
  addDaysUtc,
  parseLoggedOnParam,
  todayUtcString,
  utcDateString,
} from "./dates";

describe("dates", () => {
  it("utcDateString formate en YYYY-MM-DD", () => {
    const d = new Date("2026-06-16T15:30:00.000Z");
    expect(utcDateString(d)).toBe("2026-06-16");
  });

  it("parseLoggedOnParam rejette une date invalide", () => {
    expect(parseLoggedOnParam("pas-une-date")).toBe(todayUtcString());
  });

  it("parseLoggedOnParam accepte YYYY-MM-DD", () => {
    expect(parseLoggedOnParam("2026-01-05")).toBe("2026-01-05");
  });

  it("addDaysUtc décale les jours", () => {
    expect(addDaysUtc("2026-06-16", 1)).toBe("2026-06-17");
    expect(addDaysUtc("2026-06-16", -1)).toBe("2026-06-15");
  });
});
