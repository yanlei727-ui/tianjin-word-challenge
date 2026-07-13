import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Shapes, AlertCircle } from 'lucide-react';

const navItems = [
  { to: '/', label: '首页', Icon: Home },
  { to: '/vocabulary', label: '词汇', Icon: BookOpen },
  { to: '/grammar', label: '专项', Icon: Shapes },
  { to: '/mistakes', label: '错题', Icon: AlertCircle },
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
            <span className="mobile-nav-icon">
              <item.Icon size={20} strokeWidth={2} />
            </span>
            <span className="mobile-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
