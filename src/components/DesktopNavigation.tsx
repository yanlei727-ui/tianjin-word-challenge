import { NavLink } from 'react-router-dom';
import { BookOpen, Shapes, FileText, ListChecks, PenLine, NotebookTabs, Home } from 'lucide-react';

const navItems = [
  { to: '/', label: '首页', Icon: Home },
  { to: '/vocabulary', label: '词汇中心', Icon: BookOpen },
  { to: '/grammar', label: '语法专项', Icon: Shapes },
  { to: '/reading', label: '阅读理解', Icon: FileText },
  { to: '/cloze', label: '完形填空', Icon: ListChecks },
  { to: '/writing', label: '作文训练', Icon: PenLine },
  { to: '/mistakes', label: '错题本', Icon: NotebookTabs },
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
              <item.Icon size={15} strokeWidth={2} style={{ marginRight: 4, verticalAlign: -2 }} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
