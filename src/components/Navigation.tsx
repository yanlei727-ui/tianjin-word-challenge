import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/quick-review', label: '识词', icon: '⚡' },
  { to: '/choice-quiz', label: '选择', icon: '📝' },
  { to: '/chinese-challenge', label: '释义', icon: '🀄' },
  { to: '/favorites', label: '重点词', icon: '⭐' },
  { to: '/wrongbook', label: '错词本', icon: '📋' },
  { to: '/progress', label: '进度', icon: '📊' },
];

export default function Navigation() {
  return (
    <nav className="nav-bar">
      <div className="nav-inner">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
