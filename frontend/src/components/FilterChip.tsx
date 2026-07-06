export default function FilterChip({
  label,
  count,
  active = false,
  onClick,
}: {
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={active ? "filter-chip filter-chip-active" : "filter-chip"}
      onClick={onClick}
      title={label}
    >
      <span className="filter-chip-label">{label}</span>
      {typeof count === "number" && <span className="filter-chip-count">({count})</span>}
    </button>
  );
}
