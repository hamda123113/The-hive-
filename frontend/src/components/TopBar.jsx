import { useAuth } from '../context/AuthContext.jsx';

export default function TopBar() {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div>
        <p className="heading-sm">Case Management Dashboard</p>
        <p className="text-muted">Monitor cases, departments, and assignment workflow.</p>
      </div>
      <div className="badge">Signed in as {user?.name}</div>
    </header>
  );
}
