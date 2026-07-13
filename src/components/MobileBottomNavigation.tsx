import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '首页', icon: 'home' },
  { to: '/vocabulary', label: '词汇', icon: 'book' },
  { to: '/grammar', label: '专项', icon: 'star', isGroup: true },
  { to: '/mistakes', label: '错题', icon: 'alert' },
];

export default function MobileBottomNavigation() {
  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-nav-inner">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className={`mobile-nav-icon icon-${item.icon}`} />
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
