import { SHOWING_ENGLISH_FOCUSED_MESSAGE } from "../utils/englishFocus";

export default function ShowAllJobsToggle({
  showAll,
  onChange,
  hint = SHOWING_ENGLISH_FOCUSED_MESSAGE,
}: {
  showAll: boolean;
  onChange: (showAll: boolean) => void;
  hint?: string;
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
      {!showAll && hint && <p className="section-subtitle show-all-jobs-hint">{hint}</p>}
    </div>
  );
}
