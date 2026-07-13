import { Link } from 'react-router-dom';

interface ModuleCardProps {
  icon: string;
  title: string;
  description: string;
  route: string;
  color?: string;
  status?: string;
}

export default function ModuleCard({ icon, title, description, route, color, status }: ModuleCardProps) {
  return (
    <Link
      to={route}
      className="shared-module-card"
      style={color ? { borderLeftColor: color } : undefined}
    >
      <div className="shared-module-icon" style={color ? { color } : undefined}>{icon}</div>
      <div className="shared-module-info">
        <div className="shared-module-title">{title}</div>
        <div className="shared-module-desc">{description}</div>
        {status && <div className="shared-module-status">{status}</div>}
      </div>
      <div className="shared-module-arrow">→</div>
    </Link>
  );
}
