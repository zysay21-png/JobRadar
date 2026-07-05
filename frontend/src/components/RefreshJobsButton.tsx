import { useState } from "react";
import { runImporters } from "../api/client";

export default function RefreshJobsButton({ onRefreshed }: { onRefreshed: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      await runImporters();
      onRefreshed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh jobs.");
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
    </div>
  );
}
