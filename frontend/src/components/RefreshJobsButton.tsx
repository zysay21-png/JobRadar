import { useState } from "react";
import { runImporters } from "../api/client";
import type { ImporterRunResult } from "../types";

export default function RefreshJobsButton({ onRefreshed }: { onRefreshed: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImporterRunResult | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const runResult = await runImporters();
      setResult(runResult);
      onRefreshed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh jobs.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="refresh-jobs">
      <button
        type="button"
        className="btn btn-secondary"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "Checking official career pages..." : "Refresh Jobs"}
      </button>

      {error && <p className="state-message state-error">{error}</p>}

      {result && !error && (
        <div className="refresh-results">
          <span>Companies checked: {result.companies_checked}</span>
          <span>Companies skipped: {result.companies_skipped}</span>
          <span>Jobs found: {result.jobs_found}</span>
          <span>Jobs added: {result.jobs_added}</span>
          <span>Jobs updated: {result.jobs_updated}</span>
          <span>
            Errors:{" "}
            {result.errors.length > 0 ? result.errors.join("; ") : "none"}
          </span>
        </div>
      )}
    </div>
  );
}
