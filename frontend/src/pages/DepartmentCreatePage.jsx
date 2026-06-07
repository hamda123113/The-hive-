import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function DepartmentCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [head, setHead] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!name) {
      setError('Department name is required.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/departments', { dept_name: name, description, dept_head: head });
      navigate('/departments');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add department.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="heading-md">Create new department</h1>
          <p className="text-muted">Add a new department and specify the department head.</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '100%' }}>
        <form className="grid-gap" onSubmit={handleSubmit}>
          <label>
            Department name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter a department name" type="text" />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="5" placeholder="Describe the department" />
          </label>
          <label>
            Department head
            <input value={head} onChange={(e) => setHead(e.target.value)} placeholder="Enter department head" type="text" />
          </label>
          {error && <div style={{ color: '#f87171' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="primary" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create department'}</button>
            <button className="ghost" type="button" onClick={() => navigate('/departments')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
