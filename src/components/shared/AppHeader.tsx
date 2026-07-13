import { Link } from 'react-router-dom';

interface AppHeaderProps {
  showBack?: boolean;
  backTo?: string;
  title?: string;
  subtitle?: string;
}

export default function AppHeader({ showBack = false, backTo = '/', title, subtitle }: AppHeaderProps) {
  return (
    <header className="app-header-bar">
      {showBack ? (
        <Link to={backTo} className="header-back">← 返回</Link>
      ) : (
        <Link to="/" className="header-brand-link">
          <span className="header-brand">淳淳英语</span>
        </Link>
      )}
      {title && (
        <div className="header-title-area">
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
      )}
    </header>
  );
}
