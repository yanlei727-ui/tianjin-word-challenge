interface ContentCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export default function ContentCard({ title, subtitle, badge, badgeColor, onClick, children }: ContentCardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className={`shared-content-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="shared-content-header">
        <div>
          <div className="shared-content-title">{title}</div>
          {subtitle && <div className="shared-content-subtitle">{subtitle}</div>}
        </div>
        {badge && (
          <span
            className="shared-content-badge"
            style={badgeColor ? { background: badgeColor, color: 'white' } : undefined}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </Tag>
  );
}
