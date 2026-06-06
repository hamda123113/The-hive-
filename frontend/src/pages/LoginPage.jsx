import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const response = await login({ email, password });
    if (!response.success) {
      setError(response.message);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="page-shell" style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: '24px' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '420px' }}>
        <h2 className="heading-md">Login to your account</h2>
        <p className="text-muted" style={{ marginTop: '8px' }}>Enter your credentials to access the dashboard.</p>
        <form onSubmit={handleSubmit} className="grid-gap" style={{ marginTop: '24px' }}>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" type="password" />
          </label>
          {error && <div style={{ color: '#f87171' }}>{error}</div>}
          <button className="primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          <p className="text-muted" style={{ margin: 0 }}>
            Don&apos;t have an account? <Link to="/signup">Create one</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}
