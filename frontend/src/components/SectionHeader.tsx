import type { ReactNode } from "react";

export default function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <>
      <div className="section-header">
        <h2>{title}</h2>
        {action && <div className="section-header-actions">{action}</div>}
      </div>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </>
  );
}
