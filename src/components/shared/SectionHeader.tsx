interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="shared-section-header">
      <div>
        <h2 className="shared-section-title">{title}</h2>
        {subtitle && <p className="shared-section-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="shared-section-action">{action}</div>}
    </div>
  );
}
