import { SHOWING_ENGLISH_FOCUSED_MESSAGE } from "../utils/englishFocus";

export default function ShowAllJobsToggle({
  showAll,
  onChange,
}: {
  showAll: boolean;
  onChange: (showAll: boolean) => void;
}) {
  return (
    <div className="show-all-jobs">
      <label className="show-all-jobs-label">
        <input
          type="checkbox"
          checked={showAll}
          onChange={(event) => onChange(event.target.checked)}
        />
        Show all jobs
      </label>
      {!showAll && <p className="section-subtitle show-all-jobs-hint">{SHOWING_ENGLISH_FOCUSED_MESSAGE}</p>}
    </div>
  );
}
