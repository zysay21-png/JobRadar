export default function StatCard({
  label,
  value,
  helperText,
}: {
  label: string;
  value: string | number;
  helperText?: string;
}) {
  return (
    <div className="stat-card">
      <span className="stat-card-label">{label}</span>
      <span className="stat-card-value">{value}</span>
      {helperText && <span className="stat-card-helper">{helperText}</span>}
    </div>
  );
}
