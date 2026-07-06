import type { ReactNode } from "react";

export default function EmptyState({
  title,
  message,
  action,
}: {
  title?: string;
  message: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {title && <p className="empty-state-title">{title}</p>}
      <p className="empty-state-message">{message}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
