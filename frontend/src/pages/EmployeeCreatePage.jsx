import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

export default function EmployeeCreatePage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadDepartments() {
      try {
        const resp = await api.get('/departments');
        setDepartments(resp.data);
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    }
    loadDepartments();
  }, []);

  useEffect(() => {
    async function loadRolesForDept() {
      if (!departmentId) {
        setRoles([]);
        return;
      }
      try {
        const resp = await api.get(`/roles?department_id=${departmentId}`);
        setRoles(resp.data);
      } catch (err) {
        console.error('Failed to load roles for department', err);
      }
    }
    loadRolesForDept();
  }, [departmentId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!name || !email || !departmentId || !roleId) {
      setError('All fields are required to add a new employee.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/employees', {
        employee_name: name,
        email,
        department_id: Number(departmentId),
        role_id: Number(roleId)
      });
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add employee.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="heading-md">Create new employee</h1>
          <p className="text-muted">Add a new employee and assign them to a department and role.</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: '100%' }}>
        <form className="grid-gap" onSubmit={handleSubmit}>
          <label>
            Employee name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" type="text" />
          </label>
          <label>
            Email address
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" type="email" />
          </label>
          <label>
            Department
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.dept_name}</option>
              ))}
            </select>
          </label>
          <label>
            Role
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)}>
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.role_title}</option>
              ))}
            </select>
          </label>
          {error && <div style={{ color: '#f87171' }}>{error}</div>}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="primary" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create employee'}</button>
            <button className="ghost" type="button" onClick={() => navigate('/employees')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
