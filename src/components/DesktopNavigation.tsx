import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '首页' },
  { to: '/vocabulary', label: '词汇中心' },
  { to: '/grammar', label: '语法专项' },
  { to: '/reading', label: '阅读理解' },
  { to: '/cloze', label: '完形填空' },
  { to: '/writing', label: '作文训练' },
  { to: '/mistakes', label: '错题本' },
];

export default function DesktopNavigation() {
  return (
    <nav className="desktop-nav">
      <div className="desktop-nav-inner">
        <NavLink to="/" className="desktop-nav-brand" end>
          淳淳英语
        </NavLink>
        <div className="desktop-nav-links">
          {navItems.filter((item) => item.to !== '/').map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
