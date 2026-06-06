import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/cases', label: 'Cases' },
  { to: '/departments', label: 'Department Management' },
  { to: '/employees', label: 'Employee Management' }
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  return (
    <aside className="sidebar">
      <div>
        <span className="sidebar-brand">Case Management</span>
        <p className="text-muted">Welcome, {user?.name || 'Analyst'}</p>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div>
        <button className="ghost" onClick={logout} type="button">
          Sign out
        </button>
      </div>
    </aside>
  );
}
