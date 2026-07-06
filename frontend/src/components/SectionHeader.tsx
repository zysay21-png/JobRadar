import type { ReactNode } from "react";

// Most pages already have their own top-level heading (Home's hero <h1>,
// CompanyDetail's company-name <h1>), so SectionHeader's title is an <h2>
// by default. Companies and Jobs have no other heading on the page at
// all, so their SectionHeader is the page's main heading and needs
// level={1} — otherwise the page skips straight to <h2> with no <h1>,
// which is inconsistent with every other page and a real heading-outline
// gap for screen reader users.
export default function SectionHeader({
  title,
  subtitle,
  action,
  level = 2,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  level?: 1 | 2;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <>
      <div className="section-header">
        <Heading>{title}</Heading>
        {action && <div className="section-header-actions">{action}</div>}
      </div>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </>
  );
}
