// Job postings store work arrangement as a lowercase, sometimes-hyphenated
// value ("remote", "hybrid", "on-site"). This normalizes it to the same
// canonical casing already used for company-level work mode elsewhere in
// the app ("Remote", "Hybrid", "Onsite") — display formatting only, never
// a different underlying value. An unrecognized future value is shown
// as-is rather than guessed at.
const WORK_ARRANGEMENT_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  "on-site": "Onsite",
  onsite: "Onsite",
};

export function displayWorkArrangement(workModel: string | null | undefined): string | null {
  if (!workModel) return null;
  const trimmed = workModel.trim();
  if (!trimmed) return null;
  return WORK_ARRANGEMENT_LABELS[trimmed.toLowerCase()] ?? trimmed;
}
