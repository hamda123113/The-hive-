import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="page-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '32px' }}>
      <div className="panel hero-panel">
        <p className="heading-sm text-muted">Welcome to</p>
        <h1 className="heading-xl">Case Management Dashboard</h1>
        <p className="text-muted" style={{ marginTop: '18px', lineHeight: 1.85 }}>
          A modern case assignment system for incident response teams, department oversight, and role-based workflow.
        </p>
        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap' }}>
          <Link to="/login">
            <button className="primary" type="button">Login</button>
          </Link>
          <Link to="/signup">
            <button className="ghost" type="button">Sign up</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
