import { useEffect, useState } from 'react';
import api from '../services/api.js';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [head, setHead] = useState('');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [expandedDeptId, setExpandedDeptId] = useState(null);
  const [deptRoles, setDeptRoles] = useState({});
  const [showRoleForm, setShowRoleForm] = useState({});
  const [roleTitle, setRoleTitle] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [savingRole, setSavingRole] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        const [deptResp, roleResp] = await Promise.all([api.get('/departments'), api.get('/roles')]);
        setDepartments(deptResp.data);
        setRoles(roleResp.data);

        const rolesByDept = {};
        roleResp.data.forEach((r) => {
          if (r.department_id) {
            if (!rolesByDept[r.department_id]) rolesByDept[r.department_id] = [];
            rolesByDept[r.department_id].push(r);
          }
        });
        setDeptRoles(rolesByDept);
      } catch (err) {
        console.error('Failed to load departments or roles', err);
      }
    }

    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!name) {
      setError('Department name is required.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/departments', { dept_name: name, description, dept_head: head });
      setDepartments((prev) => [...prev, response.data]);
      setName('');
      setDescription('');
      setHead('');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add department.');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleSubmit = async (e, deptId) => {
    e.preventDefault();
    setError('');
    if (!roleTitle) {
      setError('Role title is required.');
      return;
    }
    setSavingRole((prev) => ({ ...prev, [deptId]: true }));
    try {
      const resp = await api.post('/roles', { role_title: roleTitle, description: roleDesc, department_id: deptId });
      setRoles((prev) => [...prev, resp.data]);
      setDeptRoles((prev) => ({
        ...prev,
        [deptId]: [...(prev[deptId] || []), resp.data]
      }));
      setRoleTitle('');
      setRoleDesc('');
      setShowRoleForm((prev) => ({ ...prev, [deptId]: false }));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create role.');
    } finally {
      setSavingRole((prev) => ({ ...prev, [deptId]: false }));
    }
  };

  const handleDeleteDept = async (id) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/departments/${id}`);
        setDepartments(departments.filter(d => d.id !== id));
      } catch (error) {
        console.error('Failed to delete department:', error);
        alert('Unable to delete department.');
      }
    }
  };

  const handleDeleteRole = async (roleId, deptId) => {
    if (confirm('Delete this role?')) {
      try {
        await api.delete(`/roles/${roleId}`);
        setDeptRoles((prev) => ({
          ...prev,
          [deptId]: prev[deptId].filter(r => r.id !== roleId)
        }));
      } catch (error) {
        console.error('Failed to delete role:', error);
        alert('Unable to delete role.');
      }
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="heading-md">Department management</h1>
          <p className="text-muted">Manage departments and their associated roles.</p>
        </div>
      </div>

      <div className="panel table-wrapper" style={{ marginBottom: '24px' }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Head</th>
              <th>Roles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.dept_name}</td>
                <td>{dept.description || '–'}</td>
                <td>{dept.dept_head || 'TBD'}</td>
                <td>
                  <button
                    className="ghost"
                    style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                    type="button"
                    onClick={() => setExpandedDeptId(expandedDeptId === dept.id ? null : dept.id)}
                  >
                    {expandedDeptId === dept.id ? 'Hide' : 'Show'} ({(deptRoles[dept.id] || []).length})
                  </button>
                </td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button className="ghost" style={{ padding: '6px 10px', fontSize: '0.85rem' }} type="button">Edit</button>
                  <button className="ghost" style={{ padding: '6px 10px', fontSize: '0.85rem', color: '#ef4444' }} onClick={() => handleDeleteDept(dept.id)} type="button">Delete</button>
                </td>
              </tr>
            ))}
            {!departments.length && (
              <tr>
                <td colSpan="5" style={{ color: '#94a3b8', padding: '24px' }}>No departments added yet.</td>
              </tr>
            )}
          </tbody>
        </table>

        {expandedDeptId && (
          <div style={{ padding: '20px', borderTop: '1px solid rgba(148, 163, 184, 0.14)', backgroundColor: 'rgba(96, 165, 250, 0.08)' }}>
            <h3 className="heading-sm" style={{ marginBottom: '16px' }}>
              Roles for {departments.find(d => d.id === expandedDeptId)?.dept_name}
            </h3>

            {(deptRoles[expandedDeptId] || []).length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                {(deptRoles[expandedDeptId] || []).map((role) => (
                  <div key={role.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', marginBottom: '8px' }}>
                    <div>
                      <p style={{ margin: '0', fontWeight: '500' }}>{role.role_title}</p>
                      {role.description && <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#cbd5e1' }}>{role.description}</p>}
                    </div>
                    <button className="ghost" style={{ padding: '6px 10px', fontSize: '0.85rem', color: '#ef4444' }} onClick={() => handleDeleteRole(role.id, expandedDeptId)} type="button">Delete</button>
                  </div>
                ))}
              </div>
            )}

            {!showRoleForm[expandedDeptId] && (
              <button className="primary" style={{ padding: '10px 14px' }} onClick={() => setShowRoleForm((prev) => ({ ...prev, [expandedDeptId]: true }))} type="button">+ Add role</button>
            )}

            {showRoleForm[expandedDeptId] && (
              <form onSubmit={(e) => handleRoleSubmit(e, expandedDeptId)} style={{ display: 'grid', gap: '12px' }}>
                <label style={{ margin: 0 }}>
                  Role title
                  <input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="e.g., Responder" type="text" />
                </label>
                <label style={{ margin: 0 }}>
                  Description
                  <textarea value={roleDesc} onChange={(e) => setRoleDesc(e.target.value)} rows="2" placeholder="Optional" />
                </label>
                {error && <div style={{ color: '#f87171' }}>{error}</div>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="primary" style={{ padding: '10px 14px' }} type="submit" disabled={savingRole[expandedDeptId]}>{savingRole[expandedDeptId] ? 'Saving…' : 'Add role'}</button>
                  <button className="ghost" style={{ padding: '10px 14px' }} onClick={() => setShowRoleForm((prev) => ({ ...prev, [expandedDeptId]: false }))} type="button">Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="panel" style={{ maxWidth: '100%' }}>
        <h2 className="heading-sm">Add new department</h2>
        <form className="grid-gap" onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
          <label>
            Department name
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Security Operations" />
          </label>
          <label>
            Description
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" placeholder="Describe the team responsibilities" />
          </label>
          <label>
            Department head
            <input value={head} onChange={(e) => setHead(e.target.value)} type="text" placeholder="Team lead name" />
          </label>
          {error && <div style={{ color: '#f87171' }}>{error}</div>}
          <button className="primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add department'}</button>
        </form>
      </div>
    </div>
  );
}
