import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '首页', icon: '🏠' },
  { to: '/learn', label: '学习', icon: '📖' },
  { to: '/wordlist', label: '单词表', icon: '📋' },
  { to: '/challenge', label: '闯关', icon: '🎯' },
  { to: '/wrongbook', label: '错题本', icon: '📝' },
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
