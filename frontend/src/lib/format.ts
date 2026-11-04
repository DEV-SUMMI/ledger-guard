const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "3 hours ago", "yesterday", "just now". Null or missing dates read as "Never". */
export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "Never";
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

const usdFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** Formats an integer number of cents as dollars, e.g. 123456 → "$1,234.56". */
export function formatUsd(cents: number): string {
  return usdFormat.format(cents / 100);
}
