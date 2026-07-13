interface PracticeLayoutProps {
  progress?: { current: number; total: number };
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PracticeLayout({ progress, children, actions }: PracticeLayoutProps) {
  return (
    <div className="shared-practice-layout">
      {progress && (
        <div className="shared-practice-progress">
          <span>{progress.current} / {progress.total}</span>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
      <div className="shared-practice-content">
        {children}
      </div>
      {actions && (
        <div className="shared-practice-actions">
          {actions}
        </div>
      )}
    </div>
  );
}
