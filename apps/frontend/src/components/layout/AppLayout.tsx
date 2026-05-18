import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTeamCount } from '../../hooks/useTeamCount';
import './AppLayout.css';

const navItems = [
  { to: '/teams', label: 'Teams' },
  { to: '/services', label: 'Services' },
  { to: '/search', label: 'Search' },
  { to: '/metrics', label: 'Metrics' },
  { to: '/settings', label: 'Settings' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const teamCount = useTeamCount();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <motion-root className="sidebar__brand">
          <span className="sidebar__logo">◆</span>
          <span>DevHub</span>
        </motion-root>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <p className="sidebar__user">{user?.name}</p>
          <p className="sidebar__meta">{teamCount} teams indexed</p>
          <button type="button" className="sidebar__logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
