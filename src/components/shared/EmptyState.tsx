interface EmptyStateProps {
  icon?: string;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon = '📭', title, hint, action }: EmptyStateProps) {
  return (
    <div className="shared-empty-state">
      <div className="shared-empty-icon">{icon}</div>
      <p className="shared-empty-title">{title}</p>
      {hint && <p className="shared-empty-hint">{hint}</p>}
      {action && <div className="shared-empty-action">{action}</div>}
    </div>
  );
}
