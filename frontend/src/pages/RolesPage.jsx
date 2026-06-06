import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadRoles() {
      try {
        const response = await api.get('/roles');
        setRoles(response.data);
      } catch (err) {
        console.error('Failed to load roles', err);
      }
    }
    loadRoles();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!title) {
      setError('Role title is required.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/roles', { role_title: title, description });
      setRoles((prev) => [...prev, response.data]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create role.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="heading-md">Role management</h1>
          <p className="text-muted">Define responder and analyst roles used across employees and permissions.</p>
        </div>
      </div>

      <div className="card-grid" style={{ marginBottom: '24px' }}>
        {roles.map((role) => (
          <div key={role.id} className="panel">
            <h3 className="heading-sm">{role.role_title}</h3>
            <p className="text-muted" style={{ marginTop: '8px' }}>{role.description || 'No description added.'}</p>
          </div>
        ))}
        {!roles.length && (
          <div className="panel">
            <p className="text-muted">No roles have been created yet.</p>
          </div>
        )}
      </div>

      <div className="panel" style={{ maxWidth: '760px' }}>
        <h2 className="heading-sm">Add a new role</h2>
        <form className="grid-gap" onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <label>
            Role title
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Response Analyst" type="text" />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" placeholder="Describe the responsibility of this role." />
          </label>
          {error && <div style={{ color: '#f87171' }}>{error}</div>}
          <button className="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add role'}</button>
        </form>
      </div>
    </div>
  );
}
