// The Companies page groups each company's platform into one of three
// display buckets rather than restating its exact raw value: "PC/Console"
// and "Console" are both non-mobile platforms grouped under one label,
// "Mobile" stands alone, and a company spanning both buckets is "Both".
// This is a display grouping, not a literal capability claim — a "PC"-only
// company isn't being said to support consoles, just categorized in the
// non-mobile lane. Values that don't fit either lane (e.g. "Simulation",
// used by defense/training companies) are shown as-is rather than forced
// into a bucket that would misrepresent them.
export function displayPlatform(platform: string | null | undefined): string | null {
  if (!platform) return null;
  const trimmed = platform.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  const isMobile = lower.includes("mobile");
  const isPcOrConsole = lower.includes("pc") || lower.includes("console");

  if (isMobile && isPcOrConsole) return "Both";
  if (isMobile) return "Mobile";
  if (isPcOrConsole) return "PC/Console";
  return trimmed;
}
