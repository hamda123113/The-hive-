import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/cases', icon: '🧾', label: 'Cases' },
  { to: '/departments', icon: '🏢', label: 'Departments' },
  { to: '/employees', icon: '👥', label: 'Employees' }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div>
        <span className="sidebar-brand">Case Management</span>
        <p className="sidebar-welcome">Welcome, {user?.name || 'Analyst'}</p>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon" aria-hidden="true">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="ghost danger" onClick={handleSignOut} type="button">
          Sign out
        </button>
      </div>
    </aside>
  );
}
